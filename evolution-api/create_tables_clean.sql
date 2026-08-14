-- CreateEnum

-- CreateEnum

-- CreateEnum

-- CreateEnum

-- CreateEnum

-- CreateEnum

-- CreateEnum

-- CreateTable
CREATE TABLE "Instance" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "connectionStatus" "InstanceConnectionStatus" NOT NULL DEFAULT 'open',
    "ownerJid" VARCHAR(100),
    "profileName" VARCHAR(100),
    "profilePicUrl" VARCHAR(500),
    "integration" VARCHAR(100),
    "number" VARCHAR(100),
    "businessId" VARCHAR(100),
    "token" VARCHAR(255),
    "clientName" VARCHAR(100),
    "disconnectionReasonCode" INTEGER,
    "disconnectionObject" JSONB,
    "disconnectionAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "creds" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100),
    "labels" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "instanceId" TEXT NOT NULL,
    "unreadMessages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "pushName" VARCHAR(100),
    "profilePicUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "key" JSONB NOT NULL,
    "pushName" VARCHAR(100),
    "participant" VARCHAR(100),
    "messageType" VARCHAR(100) NOT NULL,
    "message" JSONB NOT NULL,
    "contextInfo" JSONB,
    "source" "DeviceMessage" NOT NULL,
    "messageTimestamp" INTEGER NOT NULL,
    "chatwootMessageId" INTEGER,
    "chatwootInboxId" INTEGER,
    "chatwootConversationId" INTEGER,
    "chatwootContactInboxSourceId" VARCHAR(100),
    "chatwootIsRead" BOOLEAN,
    "instanceId" TEXT NOT NULL,
    "webhookUrl" VARCHAR(500),
    "status" VARCHAR(30),
    "sessionId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageUpdate" (
    "id" TEXT NOT NULL,
    "keyId" VARCHAR(100) NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "fromMe" BOOLEAN NOT NULL,
    "participant" VARCHAR(100),
    "pollUpdates" JSONB,
    "status" VARCHAR(30) NOT NULL,
    "messageId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "MessageUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "headers" JSONB,
    "enabled" BOOLEAN DEFAULT true,
    "events" JSONB,
    "webhookByEvents" BOOLEAN DEFAULT false,
    "webhookBase64" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chatwoot" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN DEFAULT true,
    "accountId" VARCHAR(100),
    "token" VARCHAR(100),
    "url" VARCHAR(500),
    "nameInbox" VARCHAR(100),
    "signMsg" BOOLEAN DEFAULT false,
    "signDelimiter" VARCHAR(100),
    "number" VARCHAR(100),
    "reopenConversation" BOOLEAN DEFAULT false,
    "conversationPending" BOOLEAN DEFAULT false,
    "mergeBrazilContacts" BOOLEAN DEFAULT false,
    "importContacts" BOOLEAN DEFAULT false,
    "importMessages" BOOLEAN DEFAULT false,
    "daysLimitImportMessages" INTEGER,
    "organization" VARCHAR(100),
    "logo" VARCHAR(500),
    "ignoreJids" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Chatwoot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "labelId" VARCHAR(100),
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(100) NOT NULL,
    "predefinedId" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proxy" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "host" VARCHAR(100) NOT NULL,
    "port" VARCHAR(100) NOT NULL,
    "protocol" VARCHAR(100) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Proxy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "rejectCall" BOOLEAN NOT NULL DEFAULT false,
    "msgCall" VARCHAR(100),
    "groupsIgnore" BOOLEAN NOT NULL DEFAULT false,
    "alwaysOnline" BOOLEAN NOT NULL DEFAULT false,
    "readMessages" BOOLEAN NOT NULL DEFAULT false,
    "readStatus" BOOLEAN NOT NULL DEFAULT false,
    "syncFullHistory" BOOLEAN NOT NULL DEFAULT false,
    "wavoipToken" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rabbitmq" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Rabbitmq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nats" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Nats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sqs" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Sqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kafka" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Kafka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Websocket" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Websocket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pusher" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "appId" VARCHAR(100) NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "secret" VARCHAR(100) NOT NULL,
    "cluster" VARCHAR(100) NOT NULL,
    "useTLS" BOOLEAN NOT NULL DEFAULT false,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Pusher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Typebot" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "url" VARCHAR(500) NOT NULL,
    "typebot" VARCHAR(100) NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "ignoreJids" JSONB,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Typebot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypebotSetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "typebotIdFallback" VARCHAR(100),
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "TypebotSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(500) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "mimetype" VARCHAR(100) NOT NULL,
    "createdAt" DATE DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenaiCreds" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "apiKey" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "OpenaiCreds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenaiBot" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "botType" "OpenaiBotType" NOT NULL,
    "assistantId" VARCHAR(255),
    "functionUrl" VARCHAR(500),
    "model" VARCHAR(100),
    "systemMessages" JSONB,
    "assistantMessages" JSONB,
    "userMessages" JSONB,
    "maxTokens" INTEGER,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "ignoreJids" JSONB,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "openaiCredsId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "OpenaiBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSession" (
    "id" TEXT NOT NULL,
    "sessionId" VARCHAR(255) NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "pushName" TEXT,
    "status" "SessionStatus" NOT NULL,
    "awaitUser" BOOLEAN NOT NULL DEFAULT false,
    "context" JSONB,
    "type" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,
    "parameters" JSONB,
    "botId" TEXT,

    CONSTRAINT "IntegrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenaiSetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "speechToText" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "openaiCredsId" TEXT NOT NULL,
    "openaiIdFallback" VARCHAR(100),
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "OpenaiSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "templateId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "template" JSONB NOT NULL,
    "webhookUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dify" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "botType" "DifyBotType" NOT NULL,
    "apiUrl" VARCHAR(255),
    "apiKey" VARCHAR(255),
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Dify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DifySetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "difyIdFallback" VARCHAR(100),
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "DifySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolutionBot" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "apiUrl" VARCHAR(255),
    "apiKey" VARCHAR(255),
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "EvolutionBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolutionBotSetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "botIdFallback" VARCHAR(100),
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "EvolutionBotSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flowise" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "apiUrl" VARCHAR(255),
    "apiKey" VARCHAR(255),
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Flowise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowiseSetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "flowiseIdFallback" VARCHAR(100),
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "FlowiseSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IsOnWhatsapp" (
    "id" TEXT NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "jidOptions" TEXT NOT NULL,
    "lid" VARCHAR(100),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "IsOnWhatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "N8n" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "webhookUrl" VARCHAR(255),
    "basicAuthUser" VARCHAR(255),
    "basicAuthPass" VARCHAR(255),
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "N8n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "N8nSetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "n8nIdFallback" VARCHAR(100),
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "N8nSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evoai" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255),
    "agentUrl" VARCHAR(255),
    "apiKey" VARCHAR(255),
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "triggerType" "TriggerType",
    "triggerOperator" "TriggerOperator",
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "Evoai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvoaiSetting" (
    "id" TEXT NOT NULL,
    "expire" INTEGER DEFAULT 0,
    "keywordFinish" VARCHAR(100),
    "delayMessage" INTEGER,
    "unknownMessage" VARCHAR(100),
    "listeningFromMe" BOOLEAN DEFAULT false,
    "stopBotFromMe" BOOLEAN DEFAULT false,
    "keepOpen" BOOLEAN DEFAULT false,
    "debounceTime" INTEGER,
    "ignoreJids" JSONB,
    "splitMessages" BOOLEAN DEFAULT false,
    "timePerChar" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "evoaiIdFallback" VARCHAR(100),
    "instanceId" TEXT NOT NULL,

    CONSTRAINT "EvoaiSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instance_name_key" ON "Instance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");

-- CreateIndex
CREATE INDEX "Chat_instanceId_idx" ON "Chat"("instanceId");

-- CreateIndex
CREATE INDEX "Chat_remoteJid_idx" ON "Chat"("remoteJid");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_instanceId_remoteJid_key" ON "Chat"("instanceId", "remoteJid");

-- CreateIndex
CREATE INDEX "Contact_remoteJid_idx" ON "Contact"("remoteJid");

-- CreateIndex
CREATE INDEX "Contact_instanceId_idx" ON "Contact"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_remoteJid_instanceId_key" ON "Contact"("remoteJid", "instanceId");

-- CreateIndex
CREATE INDEX "Message_instanceId_idx" ON "Message"("instanceId");

-- CreateIndex
CREATE INDEX "MessageUpdate_instanceId_idx" ON "MessageUpdate"("instanceId");

-- CreateIndex
CREATE INDEX "MessageUpdate_messageId_idx" ON "MessageUpdate"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_instanceId_key" ON "Webhook"("instanceId");

-- CreateIndex
CREATE INDEX "Webhook_instanceId_idx" ON "Webhook"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Chatwoot_instanceId_key" ON "Chatwoot"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_labelId_instanceId_key" ON "Label"("labelId", "instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Proxy_instanceId_key" ON "Proxy"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_instanceId_key" ON "Setting"("instanceId");

-- CreateIndex
CREATE INDEX "Setting_instanceId_idx" ON "Setting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Rabbitmq_instanceId_key" ON "Rabbitmq"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Nats_instanceId_key" ON "Nats"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Sqs_instanceId_key" ON "Sqs"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Kafka_instanceId_key" ON "Kafka"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Websocket_instanceId_key" ON "Websocket"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Pusher_instanceId_key" ON "Pusher"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "TypebotSetting_instanceId_key" ON "TypebotSetting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_messageId_key" ON "Media"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "OpenaiCreds_name_key" ON "OpenaiCreds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OpenaiCreds_apiKey_key" ON "OpenaiCreds"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "OpenaiSetting_openaiCredsId_key" ON "OpenaiSetting"("openaiCredsId");

-- CreateIndex
CREATE UNIQUE INDEX "OpenaiSetting_instanceId_key" ON "OpenaiSetting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_templateId_key" ON "Template"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DifySetting_instanceId_key" ON "DifySetting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionBotSetting_instanceId_key" ON "EvolutionBotSetting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowiseSetting_instanceId_key" ON "FlowiseSetting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "IsOnWhatsapp_remoteJid_key" ON "IsOnWhatsapp"("remoteJid");

-- CreateIndex
CREATE UNIQUE INDEX "N8nSetting_instanceId_key" ON "N8nSetting"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "EvoaiSetting_instanceId_key" ON "EvoaiSetting"("instanceId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "IntegrationSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUpdate" ADD CONSTRAINT "MessageUpdate_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUpdate" ADD CONSTRAINT "MessageUpdate_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatwoot" ADD CONSTRAINT "Chatwoot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proxy" ADD CONSTRAINT "Proxy_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rabbitmq" ADD CONSTRAINT "Rabbitmq_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nats" ADD CONSTRAINT "Nats_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sqs" ADD CONSTRAINT "Sqs_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kafka" ADD CONSTRAINT "Kafka_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Websocket" ADD CONSTRAINT "Websocket_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pusher" ADD CONSTRAINT "Pusher_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Typebot" ADD CONSTRAINT "Typebot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypebotSetting" ADD CONSTRAINT "TypebotSetting_typebotIdFallback_fkey" FOREIGN KEY ("typebotIdFallback") REFERENCES "Typebot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypebotSetting" ADD CONSTRAINT "TypebotSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenaiCreds" ADD CONSTRAINT "OpenaiCreds_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenaiBot" ADD CONSTRAINT "OpenaiBot_openaiCredsId_fkey" FOREIGN KEY ("openaiCredsId") REFERENCES "OpenaiCreds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenaiBot" ADD CONSTRAINT "OpenaiBot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSession" ADD CONSTRAINT "IntegrationSession_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenaiSetting" ADD CONSTRAINT "OpenaiSetting_openaiCredsId_fkey" FOREIGN KEY ("openaiCredsId") REFERENCES "OpenaiCreds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenaiSetting" ADD CONSTRAINT "OpenaiSetting_openaiIdFallback_fkey" FOREIGN KEY ("openaiIdFallback") REFERENCES "OpenaiBot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenaiSetting" ADD CONSTRAINT "OpenaiSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dify" ADD CONSTRAINT "Dify_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DifySetting" ADD CONSTRAINT "DifySetting_difyIdFallback_fkey" FOREIGN KEY ("difyIdFallback") REFERENCES "Dify"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DifySetting" ADD CONSTRAINT "DifySetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionBot" ADD CONSTRAINT "EvolutionBot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionBotSetting" ADD CONSTRAINT "EvolutionBotSetting_botIdFallback_fkey" FOREIGN KEY ("botIdFallback") REFERENCES "EvolutionBot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionBotSetting" ADD CONSTRAINT "EvolutionBotSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flowise" ADD CONSTRAINT "Flowise_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowiseSetting" ADD CONSTRAINT "FlowiseSetting_flowiseIdFallback_fkey" FOREIGN KEY ("flowiseIdFallback") REFERENCES "Flowise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowiseSetting" ADD CONSTRAINT "FlowiseSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "N8n" ADD CONSTRAINT "N8n_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "N8nSetting" ADD CONSTRAINT "N8nSetting_n8nIdFallback_fkey" FOREIGN KEY ("n8nIdFallback") REFERENCES "N8n"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "N8nSetting" ADD CONSTRAINT "N8nSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evoai" ADD CONSTRAINT "Evoai_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvoaiSetting" ADD CONSTRAINT "EvoaiSetting_evoaiIdFallback_fkey" FOREIGN KEY ("evoaiIdFallback") REFERENCES "Evoai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvoaiSetting" ADD CONSTRAINT "EvoaiSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

