import { lifeStage } from '@mimascota/shared';
import { describe, expect, it } from 'vitest';
import { computeReminders, type ReminderInput } from './reminders';

const TODAY = '2026-11-20';

const empty = (pets: ReminderInput['pets']): ReminderInput => ({ pets, vaccinations: [], dewormings: [], checkups: [] });

describe('lifeStage', () => {
  it('cachorro < 4 meses → cada 28 días', () => {
    const s = lifeStage({ species: 'perro', birthDate: '2026-09-01' }, TODAY);
    expect(s.stage).toBe('cachorro');
    expect(s.intervalDays).toBe(28);
  });

  it('a los 4 meses pasa a adulto (anual)', () => {
    const s = lifeStage({ species: 'perro', birthDate: '2026-07-20' }, TODAY);
    expect(s.stage).toBe('adulto');
    expect(s.intervalDays).toBe(365);
  });

  it('perro grande senior desde los 7 años', () => {
    expect(lifeStage({ species: 'perro', size: 'grande', birthDate: '2019-11-20' }, TODAY).stage).toBe('senior');
    expect(lifeStage({ species: 'perro', size: 'grande', birthDate: '2019-11-21' }, TODAY).stage).toBe('adulto');
  });

  it('perro pequeño senior desde los 8 años', () => {
    expect(lifeStage({ species: 'perro', size: 'pequeno', birthDate: '2019-01-01' }, TODAY).stage).toBe('adulto');
    expect(lifeStage({ species: 'perro', size: 'pequeno', birthDate: '2018-11-20' }, TODAY).stage).toBe('senior');
  });

  it('gato senior desde los 10 años, cada 180 días', () => {
    const s = lifeStage({ species: 'gato', birthDate: '2016-01-01' }, TODAY);
    expect(s.stage).toBe('senior');
    expect(s.intervalDays).toBe(180);
  });

  it('sin fecha de nacimiento → adulto', () => {
    expect(lifeStage({ species: 'gato' }, TODAY).stage).toBe('adulto');
  });
});

describe('computeReminders', () => {
  const pet = { id: 1, name: 'Luna', species: 'perro', size: 'mediano', birthDate: '2022-01-01' };

  it('sin controles → pendiente', () => {
    const [r] = computeReminders(empty([pet]), TODAY);
    expect(r).toMatchObject({ kind: 'control', status: 'pendiente', dueDate: null });
  });

  it('vacuna vencida y próxima', () => {
    const input: ReminderInput = {
      ...empty([pet]),
      vaccinations: [
        { petId: 1, name: 'Antirrábica', dateApplied: '2025-11-01', nextDue: '2026-11-01' },
        { petId: 1, name: 'Séxtuple', dateApplied: '2025-12-10', nextDue: '2026-12-10' },
      ],
      checkups: [{ petId: 1, date: '2026-06-01' }],
    };
    const rs = computeReminders(input, TODAY);
    expect(rs.find((r) => r.title.includes('Antirrábica'))).toMatchObject({ status: 'vencido', daysLeft: -19 });
    expect(rs.find((r) => r.title.includes('Séxtuple'))).toMatchObject({ status: 'proximo', daysLeft: 20 });
    expect(rs.find((r) => r.kind === 'control')).toMatchObject({ status: 'al_dia', dueDate: '2027-06-01' });
    expect(rs[0].status).toBe('vencido');
  });

  it('un refuerzo nuevo reemplaza al anterior', () => {
    const input: ReminderInput = {
      ...empty([pet]),
      vaccinations: [
        { petId: 1, name: 'Antirrábica', dateApplied: '2024-11-01', nextDue: '2025-11-01' },
        { petId: 1, name: 'antirrábica ', dateApplied: '2025-11-05', nextDue: '2026-11-05' },
        { petId: 1, name: 'Antirrábica', dateApplied: '2026-11-10', nextDue: '2027-11-10' },
      ],
    };
    const vac = computeReminders(input, TODAY).filter((r) => r.kind === 'vacuna');
    expect(vac).toHaveLength(1);
    expect(vac[0]).toMatchObject({ dueDate: '2027-11-10', status: 'al_dia' });
  });

  it('desparasitación interna y externa por separado', () => {
    const input: ReminderInput = {
      ...empty([pet]),
      dewormings: [
        { petId: 1, type: 'interna', product: 'Comprimido', dateApplied: '2026-08-01', nextDue: '2026-11-01' },
        { petId: 1, type: 'externa', product: 'Pipeta', dateApplied: '2026-11-01', nextDue: '2026-12-01' },
      ],
    };
    const rs = computeReminders(input, TODAY).filter((r) => r.kind === 'desparasitacion');
    expect(rs.map((r) => r.status)).toEqual(['vencido', 'proximo']);
  });

  it('cachorro: control a los 28 días del último', () => {
    const puppy = { id: 2, name: 'Toby', species: 'perro', birthDate: '2026-09-01' };
    const rs = computeReminders({ ...empty([puppy]), checkups: [{ petId: 2, date: '2026-11-01' }] }, TODAY);
    expect(rs[0]).toMatchObject({ dueDate: '2026-11-29', status: 'proximo', daysLeft: 9 });
  });
});
