//Bir metni aktif kurallarla karşılaştırır ve karar verir.
import { Injectable } from '@nestjs/common';
import type { RuleMatch, ScanResult, ScanVerdict } from './moderation.types';
import { ModerationRulesService } from './moderation-rules.service';
import { normalizeText, toWords } from './text-normalizer';

const MIN_PREFIX_MATCH_LENGTH = 4;

@Injectable()
export class ContentScannerService {
  constructor(private readonly rulesService: ModerationRulesService) {}

  /*Metni temizler ve kelimelere böler.
    Her aktif kuralı kontrol eder:
    WORD kuralı: Kelimelerden biriyle eşleşiyor mu?
    PHRASE kuralı: Cümle metnin içinde, bir kelime başından başlayarak geçiyor mu?
    Takılınan kuralları listeler ve karar verir.*/
  async scan(text: string): Promise<ScanResult> {
    const words = toWords(normalizeText(text));
    const sentence = ` ${words.join(' ')}`;
    const rules = await this.rulesService.getActiveRules();
    const matches: RuleMatch[] = rules
      .filter((rule) =>
        rule.matchType === 'WORD'
          ? this.matchesWord(words, rule.pattern)
          : sentence.includes(` ${rule.pattern}`),
      )
      .map((rule) => ({ ruleId: rule.id, pattern: rule.pattern, action: rule.action }));
    return { verdict: this.decide(matches), matches };
  }

  private matchesWord(words: string[], pattern: string): boolean {
    return pattern.length >= MIN_PREFIX_MATCH_LENGTH
      ? words.some((word) => word.startsWith(pattern))
      : words.includes(pattern);
  }

  private decide(matches: RuleMatch[]): ScanVerdict {
    if (matches.some((match) => match.action === 'BLOCK')) {
      return 'BLOCK';
    }
    return matches.length > 0 ? 'FLAG' : 'CLEAN';
  }
}
