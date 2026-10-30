import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { User } from '../users/users.types';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RuleResponseDto } from './dto/rule-response.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ModerationRulesService } from './moderation-rules.service';

@Roles('ADMIN')
@Controller('admin/moderation-rules')
export class AdminModerationRulesController {
  constructor(private readonly rulesService: ModerationRulesService) {}

  @Get()
  async list(): Promise<RuleResponseDto[]> {
    const rules = await this.rulesService.listAll();
    return rules.map((rule) => RuleResponseDto.from(rule));
  }

  @Post()
  async create(@Body() dto: CreateRuleDto, @CurrentUser() admin: User): Promise<RuleResponseDto> {
    return RuleResponseDto.from(await this.rulesService.create(dto, admin));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRuleDto,
  ): Promise<RuleResponseDto> {
    return RuleResponseDto.from(await this.rulesService.update(id, dto));
  }
}
