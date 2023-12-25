import { Context, Logger, Schema } from 'koishi'
import { } from 'koishi-plugin-qianfan-service'

export const name = 'qianfan-zhishiku'
export const reusable = true
export const inject = ['qianfan']

const logger = new Logger(name)

export interface Config {
  command: string;
  description?: string;
  endpoint: string;
  temperature?: number;
  top_p?: number;
  penalty_score?: number;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    command: Schema.string().required().description("指令"),
    description: Schema.string().default("").description("指令描述"),
    endpoint: Schema.string().required().description("服务地址后缀"),
  }),
  Schema.object({
    temperature: Schema.number().default(0.95).min(0.01).max(1).role('slider').step(0.01).description("较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定"),
    top_p: Schema.number().default(0).min(0).max(1).role('slider').step(0.01).description("影响输出文本的多样性，取值越大，生成文本的多样性越强"),
    penalty_score: Schema.number().default(1.0).min(1).max(2).role('slider').step(0.01).description("通过对已生成的token增加惩罚，减少重复生成的现象，值越大表示惩罚越大"),
  }).description("大模型参数")
])

export function apply(ctx: Context, config: Config) {
  ctx.command(config.command, config.description).action(async ({session}) => {
    logger.debug("query", session.content)
    const resp = await ctx.qianfan.plugin(config.endpoint, ["uuid-zhishiku"], {
      query: session.content,
      llm: {
        temperature: config.temperature,
        top_p: config.top_p,
        penalty_score: config.penalty_score,
      }
    })
    logger.debug("resp", resp)
    try {
      return resp.result
    } catch (error) {
      return "请求失败"
    }
  })
}
