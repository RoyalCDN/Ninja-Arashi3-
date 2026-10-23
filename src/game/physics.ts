import { Platform, Rect } from '../types/game';

export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function updateMovingPlatforms(platforms: Platform[], dt: number) {
  for (const plat of platforms) {
    if (plat.moving) {
      const { axis, range, speed, startPos } = plat.moving;
      if (axis === 'x') {
        plat.x += speed * dt;
        if (plat.x > startPos + range) {
          plat.x = startPos + range;
          plat.moving.speed = -Math.abs(speed);
        } else if (plat.x < startPos - range) {
          plat.x = startPos - range;
          plat.moving.speed = Math.abs(speed);
        }
      } else if (axis === 'y') {
        plat.y += speed * dt;
        if (plat.y > startPos + range) {
          plat.y = startPos + range;
          plat.moving.speed = -Math.abs(speed);
        } else if (plat.y < startPos - range) {
          plat.y = startPos - range;
          plat.moving.speed = Math.abs(speed);
        }
      }
    }
  }
}

export interface MoveEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isOnIce?: boolean;
}

export function resolveEntityPlatformCollisions(
  entity: MoveEntity,
  platforms: Platform[],
  dt: number,
  canDropThroughOneWay: boolean = false
): { standingOnPlatform?: Platform } {
  // Move along X first
  entity.x += entity.vx * dt;

  for (const plat of platforms) {
    if (plat.type === 'one_way') continue; // One way does not collide horizontally
    if (checkAABB(entity, plat)) {
      if (entity.vx > 0) {
        entity.x = plat.x - entity.width;
      } else if (entity.vx < 0) {
        entity.x = plat.x + plat.width;
      }
      entity.vx = 0;
    }
  }

  // Move along Y
  const oldBottom = entity.y + entity.height;
  entity.y += entity.vy * dt;
  entity.isGrounded = false;
  entity.isOnIce = false;
  let standingPlat: Platform | undefined;

  for (const plat of platforms) {
    if (plat.type === 'one_way') {
      // Only collide if falling downwards and was previously above the platform top
      if (
        !canDropThroughOneWay &&
        entity.vy >= 0 &&
        oldBottom <= plat.y + 4 &&
        entity.y + entity.height >= plat.y &&
        entity.x + entity.width > plat.x &&
        entity.x < plat.x + plat.width
      ) {
        entity.y = plat.y - entity.height;
        entity.vy = 0;
        entity.isGrounded = true;
        standingPlat = plat;
      }
    } else {
      // Solid / Ice platforms
      if (checkAABB(entity, plat)) {
        if (entity.vy > 0) {
          // Landing on floor
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
          standingPlat = plat;
          if (plat.type === 'ice') {
            entity.isOnIce = true;
          }
        } else if (entity.vy < 0) {
          // Hitting ceiling
          entity.y = plat.y + plat.height;
          entity.vy = 0;
        }
      }
    }
  }

  // Attach to moving platform if standing on it
  if (standingPlat && standingPlat.moving) {
    if (standingPlat.moving.axis === 'x') {
      entity.x += standingPlat.moving.speed * dt;
    } else if (standingPlat.moving.axis === 'y') {
      entity.y += standingPlat.moving.speed * dt;
    }
  }

  return { standingOnPlatform: standingPlat };
}
