import { Module } from '@nestjs/common';
import { GcsController } from './gcs.controller';
import { GcsService } from './gcs.service';

@Module({
  controllers: [GcsController],
  providers: [GcsService],
  exports: [GcsService],
})
export class GcsModule {}
