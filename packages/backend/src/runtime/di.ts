import type { ServiceContainer } from '../infrastructure/utilities.js';
import { IoRedisConnection, RedisCacheManager, RedisPubSubManager, RedisDistributedLock, RedisPresenceManager, RedisStreamManager, RedisHealthChecker } from './redis/index.js';
import { InMemoryEventDispatcher, InMemoryEventSubscriber, InMemoryEventRegistry, InMemoryEventPublisher, JsonEventSerializer } from './event/index.js';
import { InMemoryQueueDispatcher, InMemoryQueueRegistry, QueueWorker, InMemoryDeadLetterQueue } from './queue/index.js';
import { WorkerRegistry, WorkerSupervisor } from './worker/index.js';
import { SchedulerEngine, CronScheduler } from './scheduler/index.js';
import { createRuntimeConfig } from './config.js';
import type { Logger } from '../logging/index.js';

export { createRuntimeConfig };

export function registerRuntime(container: ServiceContainer, env: Record<string, string | undefined>, logger: Logger): void {
  const config = createRuntimeConfig(env);

  const redis = new IoRedisConnection(logger, config.redis.url);
  container.register('redisConnection', () => redis);
  container.register('redisCacheManager', () => new RedisCacheManager(redis, logger, config.redis.keyPrefix));
  container.register('redisPubSub', () => new RedisPubSubManager(redis, logger));
  container.register('redisLock', () => new RedisDistributedLock(redis, logger));
  container.register('redisPresence', () => new RedisPresenceManager(redis, logger));
  container.register('redisStream', () => new RedisStreamManager(redis, logger));
  container.register('redisHealthChecker', () => new RedisHealthChecker(redis));

  const eventSubscriber = new InMemoryEventSubscriber();
  const eventDispatcher = new InMemoryEventDispatcher(eventSubscriber, logger);
  const eventRegistry = new InMemoryEventRegistry();
  const eventPublisher = new InMemoryEventPublisher(eventDispatcher);
  const eventSerializer = new JsonEventSerializer();

  container.register('eventSubscriber', () => eventSubscriber);
  container.register('eventDispatcher', () => eventDispatcher);
  container.register('eventRegistry', () => eventRegistry);
  container.register('eventPublisher', () => eventPublisher);
  container.register('eventSerializer', () => eventSerializer);

  const queueRegistry = new InMemoryQueueRegistry();
  const deadLetter = new InMemoryDeadLetterQueue(logger);
  const queueDispatcher = new InMemoryQueueDispatcher(queueRegistry, logger);
  const queueWorker = new QueueWorker(queueRegistry, queueDispatcher, deadLetter, logger);

  container.register('queueRegistry', () => queueRegistry);
  container.register('queueDispatcher', () => queueDispatcher);
  container.register('deadLetter', () => deadLetter);
  container.register('queueWorker', () => queueWorker);

  const workerRegistry = new WorkerRegistry(logger);
  const workerSupervisor = new WorkerSupervisor(workerRegistry, logger);

  container.register('workerRegistry', () => workerRegistry);
  container.register('workerSupervisor', () => workerSupervisor);

  const scheduler = new SchedulerEngine(logger);
  const cronScheduler = new CronScheduler(logger);

  container.register('scheduler', () => scheduler);
  container.register('cronScheduler', () => cronScheduler);
  container.register('runtimeConfig', () => config);
}
