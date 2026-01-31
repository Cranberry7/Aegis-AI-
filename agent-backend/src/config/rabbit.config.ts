import { ConfigService } from '@nestjs/config';
import {
  ClientProviderOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigVariables } from '@app/common/enums/common.enum';
import { CLIENT_PROXY_NAMES, QUEUES } from '@app/rabbitmq/rabbitmq.constant';

const QUEUE_CONFIG = [
  {
    name: CLIENT_PROXY_NAMES.NEW_KNOWLEDGE_CLIENT,
    queue: QUEUES.NEW_KNOWLEDGE,
  },
  {
    name: CLIENT_PROXY_NAMES.DELETE_KNOWLEDGE_CLIENT,
    queue: QUEUES.DELETE_KNOWLEDGE,
  },
];

const getBaseRmqConfig = (configService: ConfigService, queue: string) => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get<string>(ConfigVariables.RABBIT_MQ_URL)],
    queue: queue,
    queueOptions: {
      durable: true,
    },
  },
});

export const getRabbitMQConfig = (): ClientProviderOptions[] => {
  return QUEUE_CONFIG.map(({ name, queue }) => ({
    name,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      ...getBaseRmqConfig(configService, queue),
    }),
  }));
};

export const getRabbitMQMicroserviceConfig = (
  configService: ConfigService,
): RmqOptions => ({
  ...(getBaseRmqConfig(configService, QUEUES.COMPLETE_TRAINING) as RmqOptions),
});
