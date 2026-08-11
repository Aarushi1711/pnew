import { IsIn } from 'class-validator';

export type LevelChoice = 'practice_more' | 'move_up';

export class LevelChoiceDto {
  @IsIn(['practice_more', 'move_up'])
  choice: LevelChoice;
}
