import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface HealthCheck {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    version: string;
    checks: {
        database: {
            status: 'up' | 'down';
            responseTime?: number;
            error?: string;
        };
    };
}

export async function GET() {
    const startTime = Date.now();
    const health: HealthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '0.1.0',
        checks: {
            database: {
                status: 'down',
            },
        },
    };

    // Check database connection
    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        health.checks.database = {
            status: 'up',
            responseTime: Date.now() - dbStart,
        };
    } catch (error) {
        health.status = 'unhealthy';
        health.checks.database = {
            status: 'down',
            error: error instanceof Error ? error.message : 'Unknown database error',
        };
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
}
