import { NextResponse } from 'next/server';
import { getCurrentAdmin } from './session.js';

/**
 * Enforce admin authentication for route handlers.
 * If requirePasswordChanged is true, blocks access if mustChangePassword is true.
 * 
 * @param {Request} req
 * @param {{ requirePasswordChanged?: boolean }} options
 * @returns {Promise<{ admin: object, errorResponse?: NextResponse }>}
 */
export async function requireAdmin(req, options = { requirePasswordChanged: true }) {
  const current = await getCurrentAdmin();

  if (!current || !current.user) {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      ),
    };
  }

  if (options.requirePasswordChanged && current.user.mustChangePassword) {
    return {
      admin: current.user,
      errorResponse: NextResponse.json(
        {
          error: 'Password change required.',
          mustChangePassword: true,
        },
        { status: 403 }
      ),
    };
  }

  return { admin: current.user, session: current.session };
}
