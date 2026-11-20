import type { NextFunction, Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: { id: number };
    }
  }
}

/**
 * Por ahora la app es de un solo usuario: todo pertenece al usuario 1 (sembrado en initDb).
 * Para hacerla multiusuario, reemplazar este middleware por uno de autenticación
 * (sesión / JWT) que setee `req.user`. Todas las rutas ya filtran por `req.user.id`.
 */
export function currentUser(req: Request, _res: Response, next: NextFunction) {
  req.user = { id: 1 };
  next();
}
