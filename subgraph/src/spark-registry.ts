import { Spark, User } from '../generated/schema'
import {
  SparkCreated,
  SparkDeleted,
  SparkLiked,
  SparkUnliked
} from '../generated/SparkRegistry/SparkRegistry'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleSparkCreated(event: SparkCreated): void {
  let spark = new Spark(event.params.sparkId.toString())
  spark.content = event.params.content
  spark.author = event.params.author.toHexString()
  spark.mediaHash = event.params.mediaHash
  spark.timestamp = event.block.timestamp
  spark.likes = 0
  spark.rebounds = 0
  spark.isDeleted = false
  spark.save()

  let user = User.load(event.params.author.toHexString())
  if (user == null) {
    user = new User(event.params.author.toHexString())
  }
  user.save()
}

export function handleSparkDeleted(event: SparkDeleted): void {
  let spark = Spark.load(event.params.sparkId.toString())
  if (spark != null) {
    spark.isDeleted = true
    spark.save()
  }
}

export function handleSparkLiked(event: SparkLiked): void {
  let spark = Spark.load(event.params.sparkId.toString())
  if (spark != null) {
    spark.likes += 1
    spark.save()
  }
}

export function handleSparkUnliked(event: SparkUnliked): void {
  let spark = Spark.load(event.params.sparkId.toString())
  if (spark != null && spark.likes > 0) {
    spark.likes -= 1
    spark.save()
  }
}