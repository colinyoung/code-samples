MACHINE_NAMES = ['CTScan', 'CardiacCath', 'Fluoro', 'NucMed', 'GuideWire1', 'GuideWire2', 'ChestXray1', 'ChestXray2'];

var Machine = function (machineName, hasPatient, listeners) {
  _.extend(this, SpriteMethods);
  this._hasPatient = hasPatient;

  // start positions are wrong, are relative to a top-left origin, must be
  // converted to bottom left origin
  STAGE_HEIGHT = 2304;
  function correctYValue (val) {
    return Math.abs(STAGE_HEIGHT - val);
  }

  this._startPositions = {
    'CTScan' : [{x: 330, y: correctYValue(500)}],
    'CardiacCath' : [{x: 1114, y: correctYValue(405)}],
    'Fluoro' : [{x:1701, y: correctYValue(300)}],
    'NucMed' : [{x:2108, y: correctYValue(382)}],
    'GuideWire' : [{x:191, y: correctYValue(1859)}, {x:1175, y: correctYValue(2005)}],
    'ChestXray' : [{x:423, y: correctYValue(2000)}, {x:1480, y: correctYValue(1875)}],
  }

  this.getNumberOfActiveFrames = function() {
    switch (this.getMachineName()) {
      case 'CardiacCath': return 4;
      case 'ChestXray': return 6;
      case 'CTScan': return 7;
      case 'Fluoro': return 7;
      case 'GuideWire': return 4;
      case 'NucMed': return 9;
    }
  }

  this._machineName = machineName;
  this.listeners = listeners;

  // this.facingDir = 'down';
  this.config = {
    frames: 5,
    animationSpeedPassive: 1.5,
    animationSpeedActive: 0.3,
  };

  this.addToLayer = function(layer) {
    this.layer = layer;

    cc.spriteFrameCache.addSpriteFrames(this.getPlistSpriteSheetResource('Active'));
    cc.spriteFrameCache.addSpriteFrames(this.getPlistSpriteSheetResource('Passive'));

    this.sprite = cc.Sprite.create(this.getBaseSpriteResource());
    this.sprite.attr({
      scale: SPRITE_SCALE
    });
    this.sprite.setAnchorPoint({x: 0.5, y: 0.5});

    this.position = this.getPosition();

    this.sprite.setPosition({
      x: this.position.x,
      y: this.position.y
    });

    console.log(this._machineName + ' chose location ' + this.position.x + ', ' + this.position.y);
    this.layer.addChild(this.sprite, 0);

    if (DEBUG) {
      _.each(this.collisionGroupBounds, function(bounds) {
        Rect.drawDebugRect(this.getTilemap(), bounds, Rect.RED_COLOR);
      }.bind(this));
    }

    // Run base animation
    this.animatePassive();
  }

  this.setHasPatient = function (hasPatient) {
    this._hasPatient = hasPatient;
  }
  this.setHasPatientAndAnimate = function (hasPatient) {
    this.setHasPatient(hasPatient);
    this.animatePassive();
  }
  this.hasPatient = function () {
    return this._hasPatient;
  }

  this.animatePassive = function() {
    this.sprite.stopAllActions();
    var i;
    var animFrames = [];
    var numFrames = this.hasPatient() ? 2 : 1;
    for (i = 1; i < numFrames + 1; i++) {
      var filename;
      if (this.hasPatient()) {
        filename = this.spriteFilename('Patient' + i);
      } else {
        filename = this.spriteFilename('Empty');
      }
      var spriteFrame = cc.spriteFrameCache.getSpriteFrame(filename);
      var animFrame = new cc.AnimationFrame();
      animFrame.initWithSpriteFrame(spriteFrame, 1, null);
      animFrames.push(animFrame);
    }

    var animation = cc.Animation.createWithAnimationFrames(animFrames, this.config.animationSpeedPassive);
    var animate = cc.Animate.create(animation);
    var forever = cc.RepeatForever.create(animate);
    this.sprite.runAction(forever);
  }

  this.getFootprint = function() {
    if (!this.sprite || !this.sprite.parent) return;
    return this.sprite.getBoundingBox();
  }

  this.animateActive = function() {
    this.sprite.stopAllActions();
    var i;
    var animFrames = [];
    var numFrames = this.getNumberOfActiveFrames();
    for (i = 1; i < numFrames + 1; i++) {
      var filename = this.spriteFilename(i.toString());
      var spriteFrame = cc.spriteFrameCache.getSpriteFrame(filename);
      var animFrame = new cc.AnimationFrame();
      animFrame.initWithSpriteFrame(spriteFrame, 1, null);
      animFrames.push(animFrame);
    }

    var animation = cc.Animation.createWithAnimationFrames(animFrames, this.config.animationSpeedActive);
    var animate = cc.Animate.create(animation);
    var forever = cc.RepeatForever.create(animate);
    this.sprite.runAction(forever);
  }

  this.getBaseSpriteResource = function() {
    return res["Sprite_" + this.getMachineName() + "_png"];
  }

  this.spriteFilename = function(suffix) {
    return this.getMachineName() + suffix + ".png";
  }

  this.getMachineName = function() {
    return this._machineName.replace(/[0-9]$/, '');
  }

  this.getPlistSpriteSheetResource = function(prefix) {
    return res["SpriteSheet_" + prefix + "_" + this.getMachineName() + "_plist"];
  }

  // this.getPositions = function() {
  //   return this._startPositions[this._machineName];
  // }

  this.getPosition = function() {
    var matches = this._machineName.match(/[0-9]$/);
    if (matches) {
      var machineIndex = parseInt(matches[0]);
      return this._startPositions[this.getMachineName()][machineIndex-1];
    } else {
      return this._startPositions[this.getMachineName()][0];
    }
  }

  this.getSeconds = function() {
    switch (this.getMachineName()) {
      case "CTScan": return 5;
      case "CardiacCath": return 3;
      case "Fluoro": return 3;
      case "NucMed": return 3;
      case "GuideWire": return 2;
      case "ChestXray": return 3;
      default:
        return 0;
    }
  }

  this.getPointValue = function() {
    return this.getSeconds() * 10000;
  }

  this.startWorking = function() {
    this.workingEffectId = cc.audioEngine.playEffect(res['Effect_' + this.getMachineName()], true);
    this.animateActive();
    this.activeTimeout = setTimeout(this.doneWorking.bind(this), this.getSeconds() * 1000);
  }

  this.doneWorking = function() {
    cc.audioEngine.stopEffect(this.workingEffectId);
    this.setHasPatient(false);
    this.animatePassive();
    this.listeners.patientWasTreated(this);
  }

  this.abortWorking = function() {
    this.animatePassive();
    clearTimeout(this.activeTimeout);
  }
}
