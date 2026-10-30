import { Module } from '@nestjs/common';
import { AdminModerationRulesController } from './admin-moderation-rules.controller';
import { ContentScannerService } from './content-scanner.service';
import { ModerationRulesRepository } from './moderation-rules.repository';
import { ModerationRulesService } from './moderation-rules.service';

@Module({
  controllers: [AdminModerationRulesController],
  providers: [ModerationRulesService, ModerationRulesRepository, ContentScannerService],
  exports: [ContentScannerService],
})
export class ModerationModule {}
