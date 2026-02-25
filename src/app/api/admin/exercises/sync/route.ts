import { execFile } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

export async function POST() {
  try {
    const { stdout, stderr } = await execFileAsync('node', ['scripts/sync-exercises.js'], {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 5 * 1024 * 1024,
    });

    return NextResponse.json({
      ok: true,
      stdout,
      stderr,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Sync thất bại',
        details: error?.stderr || error?.message || 'Unknown error',
        stdout: error?.stdout || '',
      },
      { status: 500 }
    );
  }
}
