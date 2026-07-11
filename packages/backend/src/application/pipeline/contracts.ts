export interface PipelineStage<TInput, TOutput> {
  name: string;
  process(input: TInput, next: () => Promise<TOutput>): Promise<TOutput>;
}
export interface Pipeline<TInput, TOutput> {
  name: string;
  use(stage: PipelineStage<TInput, TOutput>): Pipeline<TInput, TOutput>;
  execute(input: TInput, context: PipelineContext): Promise<PipelineResult<TOutput>>;
}
export interface PipelineContext {
  correlationId: string;
  workspaceId: string;
  startedAt: Date;
  metadata: Record<string, unknown>;
}
export interface PipelineResult<TOutput> {
  output: TOutput;
  stages: StageResult[];
  durationMs: number;
}
export interface StageResult {
  stageName: string;
  durationMs: number;
  success: boolean;
  error?: string;
}
