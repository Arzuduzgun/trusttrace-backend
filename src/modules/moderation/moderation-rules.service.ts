//Kuralları önbellekte tutar.
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import type { User } from '../users/users.types';
import type { CreateRuleDto } from './dto/create-rule.dto';
import type { UpdateRuleDto } from './dto/update-rule.dto';
import { MODERATION_ERRORS } from './moderation.errors';
import type { ModerationRule, RuleChanges } from './moderation.types';
import { ModerationRulesRepository } from './moderation-rules.repository';
import { normalizeText, toWords } from './text-normalizer';

@Injectable()
export class ModerationRulesService {
  private activeRulesCache: ModerationRule[] | null = null;

  constructor(private readonly rulesRepository: ModerationRulesRepository) {}

  listAll(): Promise<ModerationRule[]> {
    return this.rulesRepository.listAll();
  }

  /*Kuralı mesajlarla aynı temizlikten geçirir.
    Geriye bir şey kalmadıysa MODERATION_PATTERN_EMPTY fırlatır.
    İçinde boşluk varsa PHRASE, yoksa WORD olarak işaretler.
    Kaydeder ve önbelleği boşaltır.*/
  async create(dto: CreateRuleDto, admin: User): Promise<ModerationRule> {
    const pattern = toWords(normalizeText(dto.pattern)).join(' ');
    if (!pattern) {
      throw new DomainException(MODERATION_ERRORS.MODERATION_PATTERN_EMPTY);
    }
    const rule = await this.rulesRepository.create({
      pattern,
      matchType: pattern.includes(' ') ? 'PHRASE' : 'WORD',
      action: dto.action,
      createdBy: admin.id,
    });
    this.activeRulesCache = null;
    return rule;
  }

  //Sadece gönderilen alanları değiştirir. Hiçbir alan gönderilmediyse kuralı olduğu gibi döner. Ardından önbelleği boşaltır.
  async update(id: string, dto: UpdateRuleDto): Promise<ModerationRule> {
    const changes: RuleChanges = {
      ...(dto.action !== undefined ? { action: dto.action } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };
    const rule =
      Object.keys(changes).length === 0
        ? await this.rulesRepository.findById(id)
        : await this.rulesRepository.update(id, changes);
    if (!rule) {
      throw new DomainException(MODERATION_ERRORS.MODERATION_RULE_NOT_FOUND);
    }
    this.activeRulesCache = null;
    return rule;
  }

  //Tarayıcının kullandığı fonksiyon. Önbellek doluysa oradan döner, boşsa veritabanından doldurur.
  async getActiveRules(): Promise<ModerationRule[]> {
    this.activeRulesCache ??= await this.rulesRepository.listActive();
    return this.activeRulesCache;
  }
}
