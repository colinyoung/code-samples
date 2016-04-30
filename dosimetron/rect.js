var Rect = {
  // Objects in the tilemap's properties pane have their X and Y given
  // as the top left, however, when loaded, they are given as the BOTTOM LEFT.
  //
  //
  bounds: function(object) {
    return [
      [object.x, object.y],
      [object.x + object.width, object.y + object.height]
    ];
  },

  boundsForObjects: function(objects) {
    return _.map(objects, this.bounds);
  },

  // Bounds are given as
  // [ [minX, minY], [maxX, maxY] ]
  intersects: function(boundsA, boundsB) {
    return this.intersection(boundsA, boundsB) !== null;
  },

  intersection: function(boundsA, boundsB) {
    var minAx = boundsA[0][0],
        minAy = boundsA[0][1],
        maxAx = boundsA[1][0],
        maxAy = boundsA[1][1],

        minBx = boundsB[0][0],
        minBy = boundsB[0][1],
        maxBx = boundsB[1][0],
        maxBy = boundsB[1][1];

    if (_.isNaN(minAx)) return undefined;

    var minIx = Math.max(minAx, minBx);
    var minIy = Math.max(minAy, minBy);
    var maxIx = Math.min(maxAx, maxBx);
    var maxIy = Math.min(maxAy, maxBy);

    if (minIx >= maxIx) return;
    if (minIy >= maxIy) return;

    var rect = [[minIx, minIy], [maxIx, maxIy]];

    return rect;
  },

  intersectionSize: function(boundsA, boundsB) {
    var intersection = this.intersection(boundsA, boundsB);
    if (intersection === undefined) return;

    var size = [
      intersection[1][0] - intersection[0][0],
      intersection[1][1] - intersection[0][1]
    ];
    return size;
  },

  intersectionCornerHitCompensation: function(intersection, characterBounds, collidingObjectBounds) {
    var xMagnitude = intersection[1][0] - intersection[0][0],
        yMagnitude = intersection[1][1] - intersection[0][1];

    // we assume boundsA is the focus i.e. character
    var characterBoundsXTolerableOverlap = (characterBounds[1][0] - characterBounds[0][0]) * 0.4999;
    var characterBoundsYTolerableOverlap = (characterBounds[1][1] - characterBounds[0][1]) * 0.32; // characters are taller than wide

    FREEZE_STOPPER = 2; // bounce by an additional FREEZE_STOPPER number of pixels to avoid an issue where the sprite just gets stuck in the intersection

    // if the direction's magnitude is less than 1/3
    var compensate = {x: 0, y: 0};
    if (xMagnitude < characterBoundsXTolerableOverlap) {
      if (characterBounds[0][0] == intersection[0][0]) {
        // left side is colliding, compensate by bouncing back right
        xMagnitude += FREEZE_STOPPER;
        compensate.x = xMagnitude;
      }

      else if (characterBounds[1][0] == intersection[1][0]) {
        // right side is colliding, compensate by bouncing back left
        xMagnitude += FREEZE_STOPPER;
        compensate.x = xMagnitude * -1;
      }
    }

    if (yMagnitude < characterBoundsYTolerableOverlap) {
      if (characterBounds[0][1] == intersection[0][1]) {
        // bottom side is colliding, compensate by bouncing back up
        yMagnitude += FREEZE_STOPPER;
        compensate.y = yMagnitude;
      }

      if (characterBounds[1][1] == intersection[1][1]) {
        // top side is colliding, compensate by bouncing back down
        yMagnitude += FREEZE_STOPPER;
        compensate.y = yMagnitude * -1;
      }
    }

    // filter: keep only the larger of the two compensations
    if (Math.abs(compensate.y) >= Math.abs(compensate.x)) {
      compensate.x = 0;
    } else {
      compensate.y = 0;
    }

    return compensate;
  },

  // bounds, translation ( {x, y,} etc)
  translate: function(bounds, translation) {
    var boundsCopy = _.clone(bounds);
    if (translation.x) {
      boundsCopy.x += translation.x;
    }
    if (translation.y) {
      boundsCopy.y += translation.y
    }
    return boundsCopy;
  },

  absolutePoint: function(bounds) {
    return [Math.abs(bounds[0]), Math.abs(bounds[1])];
  },

  isLandscape: function(bounds) {
    var bl = bounds[0],
        tr = bounds[1];
    var width = tr[0] - bl[0],
        height = tr[1] - bl[1];
    return width > height;
  },

  drawDebugRect: function(layer, bounds, fillColor) {
    var boundingBox = cc.DrawNode.create();
    var origin = cc.p(bounds[0][0], bounds[0][1]);
    var destination = cc.p(bounds[1][0], bounds[1][1]);
    boundingBox.drawRect(origin, destination, fillColor, 5, cc.color(255,255,255,128));
    layer.addChild(boundingBox, 100);
    return boundingBox;
  },

  RED_COLOR: cc.color(255,0,0,128),
  GREEN_COLOR: cc.color(0,255,0,128),
  BLUE_COLOR: cc.color(0,0,255,128),
  GRAY_COLOR: cc.color(200,200,200,128),
  ORANGE_COLOR: cc.color(245,159,39,128),
  DARK_ORANGE_COLOR: cc.color(247, 80, 2)
}
