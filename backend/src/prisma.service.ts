import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({ datasources: { db: { url: process.env.DATABASE_URL } } })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Prisma connected successfully')
    } catch (error) {
      this.logger.error(
        'Prisma initialization failed. Continuing without database connection.',
        (error as Error).stack,
      )
      // NOTE: We intentionally do NOT rethrow here so that
      // the rest of the WebSocket game server can run without DB.
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect()
    } catch (error) {
      this.logger.error(
        'Error while disconnecting Prisma client',
        (error as Error).stack,
      )
    }
  }
}
