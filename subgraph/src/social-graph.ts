import { User } from '../generated/schema'
import { 
  UserOrbited, 
  UserUnorbited 
} from '../generated/SocialGraph/SocialGraph'

export function handleUserStartedOrbiting(event: UserOrbited): void {
  let orbiterId = event.params.orbiter.toHexString();
  let orbitedId = event.params.orbited.toHexString();

  let orbiter = User.load(orbiterId);
  if (orbiter == null) {
    orbiter = new User(orbiterId);
    orbiter.orbits = [];
    orbiter.orbiters = [];
  }

  let orbited = User.load(orbitedId);
  if (orbited == null) {
    orbited = new User(orbitedId);
    orbited.orbits = [];
    orbited.orbiters = [];
  }

  let currentOrbiterOrbits = orbiter.orbits;
  let currentOrbitedOrbiters = orbited.orbiters;

  let orbitExists = false;
  for (let i = 0; i < currentOrbiterOrbits.length; i++) {
    if (currentOrbiterOrbits[i] == orbitedId) {
      orbitExists = true;
      break;
    }
  }
  
  if (!orbitExists) {
    currentOrbiterOrbits.push(orbitedId);
    orbiter.orbits = currentOrbiterOrbits;
  }
  
  let orbiterExists = false;
  for (let i = 0; i < currentOrbitedOrbiters.length; i++) {
    if (currentOrbitedOrbiters[i] == orbiterId) {
      orbiterExists = true;
      break;
    }
  }
  
  if (!orbiterExists) {
    currentOrbitedOrbiters.push(orbiterId);
    orbited.orbiters = currentOrbitedOrbiters;
  }

  orbiter.save();
  orbited.save();
}

export function handleUserStoppedOrbiting(event: UserUnorbited): void {
  let orbiterId = event.params.orbiter.toHexString();
  let unorbitedId = event.params.unorbited.toHexString();

  let orbiter = User.load(orbiterId);
  let unorbited = User.load(unorbitedId);
  
  if (orbiter != null && unorbited != null) {
    
    let currentOrbiterOrbits = orbiter.orbits;
    let currentUnorbitedOrbiters = unorbited.orbiters;

    let newOrbiterOrbits: string[] = [];
    for (let i = 0; i < currentOrbiterOrbits.length; i++) {
      if (currentOrbiterOrbits[i] != unorbitedId) {
        newOrbiterOrbits.push(currentOrbiterOrbits[i]);
      }
    }
    orbiter.orbits = newOrbiterOrbits;

    let newUnorbitedOrbiters: string[] = [];
    for (let i = 0; i < currentUnorbitedOrbiters.length; i++) {
      if (currentUnorbitedOrbiters[i] != orbiterId) {
        newUnorbitedOrbiters.push(currentUnorbitedOrbiters[i]);
      }
    }
    unorbited.orbiters = newUnorbitedOrbiters;

    orbiter.save();
    unorbited.save();
  }
} 