import { Media, User } from '../generated/schema'
import { MediaRegistered, MediaDeactivated } from '../generated/MediaManager/MediaManager'
import { Address } from '@graphprotocol/graph-ts'

export function handleMediaRegistered(event: MediaRegistered): void {
  let mediaId = event.params.ipfsHash;
  let media = new Media(mediaId);
  
  media.ipfsHash = event.params.ipfsHash;
  
  let uploaderId = event.params.owner.toHexString();
  let uploader = User.load(uploaderId);
  if (uploader == null) {
    uploader = new User(uploaderId);
    uploader.save();
  }
  
  media.uploader = uploaderId;
  media.contentType = event.params.contentType;
  media.timestamp = event.block.timestamp;
  media.isActive = true;
  media.save();
}

export function handleMediaDeactivated(event: MediaDeactivated): void {
  let mediaId = event.params.ipfsHash;
  let media = Media.load(mediaId);
  if (media != null) {
    media.isActive = false;
    media.save();
  }
} 