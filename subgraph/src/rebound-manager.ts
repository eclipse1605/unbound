import { Rebound, Spark, User } from '../generated/schema'
import { SparkRebounded } from '../generated/ReboundManager/ReboundManager'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleSparkRebounded(event: SparkRebounded): void {
  let rebound = new Rebound(event.params.reboundId.toString())
  rebound.originalSpark = event.params.originalSparkId.toString()
  rebound.rebounder = event.params.rebounder.toHexString()
  rebound.comment = event.params.comment
  rebound.timestamp = event.block.timestamp
  rebound.save()

  let spark = Spark.load(event.params.originalSparkId.toString())
  if (spark != null) {
    spark.rebounds += 1
    spark.save()
  }

  let user = User.load(event.params.rebounder.toHexString())
  if (user == null) {
    user = new User(event.params.rebounder.toHexString())
  }
  user.save()
}