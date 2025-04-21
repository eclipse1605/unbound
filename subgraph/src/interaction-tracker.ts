import { Interaction, Comment, Spark, User } from '../generated/schema'
import { 
  InteractionCreated,
  CommentCreated,
  SparkLiked,
  SparkUnliked
} from '../generated/InteractionTracker/InteractionTracker'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleInteractionCreated(event: InteractionCreated): void {
  let interactionId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let sparkId = event.params.sparkId.toString()
  let userId = event.params.user.toHexString()
  
  let interaction = new Interaction(interactionId)
  interaction.spark = sparkId
  interaction.user = userId
  interaction.timestamp = event.block.timestamp

  if (event.params.interactionType == 0) {
    interaction.type = "LIKE"
  } else if (event.params.interactionType == 1) {
    interaction.type = "COMMENT"
  } else if (event.params.interactionType == 2) {
    interaction.type = "REBOUND"
  } else {
    interaction.type = "UNKNOWN"
  }
  
  interaction.content = event.params.content
  interaction.save()

  let spark = Spark.load(sparkId)
  if (spark != null) {
    spark.save()
  }

  let user = User.load(userId)
  if (user == null) {
    user = new User(userId)
    user.save()
  }
}

export function handleCommentCreated(event: CommentCreated): void {
  let commentId = event.params.id.toString()
  let sparkId = event.params.sparkId.toString()
  let userId = event.params.author.toHexString()
  
  let comment = new Comment(commentId)
  comment.spark = sparkId
  comment.author = userId
  comment.content = event.params.content
  comment.timestamp = event.params.timestamp
  comment.save()

  let user = User.load(userId)
  if (user == null) {
    user = new User(userId)
    user.save()
  }

  let spark = Spark.load(sparkId)
  if (spark != null) {
    
    spark.save()
  }
}

export function handleSparkLiked(event: SparkLiked): void {
  let sparkId = event.params.sparkId.toString()
  let userId = event.params.liker.toHexString()

  let spark = Spark.load(sparkId)
  if (spark != null) {
    spark.likes = spark.likes + 1
    spark.save()
  }

  let user = User.load(userId)
  if (user == null) {
    user = new User(userId)
    user.save()
  }
}

export function handleSparkUnliked(event: SparkUnliked): void {
  let sparkId = event.params.sparkId.toString()

  let spark = Spark.load(sparkId)
  if (spark != null && spark.likes > 0) {
    spark.likes = spark.likes - 1
    spark.save()
  }
} 