ALPHABET = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var NameEntryLayer = cc.Layer.extend({
  ctor: function() {
    this._super();

    var scene = ccs.load(res.NameEntryScene_json);
    this.dosimeter = scene.node.getChildByName('dosimeter');
    this.dosimeter.retain();
    this.letters = [0,0,0];
    this.selectedLetter = 0;
    this.helpLabel = scene.node.getChildByName('helpLabel');
    this.helpLabel.retain();

    this.initial1 = scene.node.getChildByName('initial1');
    this.initial1.retain();
    this.initial2 = scene.node.getChildByName('initial2');
    this.initial2.retain();
    this.initial3 = scene.node.getChildByName('initial3');
    this.initial3.retain();

    this.initial1Highlight = scene.node.getChildByName('initial1Highlight');
    this.initial2Highlight = scene.node.getChildByName('initial2Highlight');
    this.initial3Highlight = scene.node.getChildByName('initial3Highlight');

    this.node = scene.node;
    this.addChild(scene.node);

    this.config = {
      frames: 6
    };

    cc.spriteFrameCache.addSpriteFrames(res.SpriteSheet_Dosimeter_plist);
  },
  setCallback: function(callback) {
    this._callback = callback;
  },
  animate: function() {
    var i;
    var animFrames = [];
    for (i = 1; i < this.config.frames + 1; i++) {
      var filename = "Dos" + i + ".png",
          spriteFrame = cc.spriteFrameCache.getSpriteFrame(filename);

      var animFrame = new cc.AnimationFrame();
      animFrame.initWithSpriteFrame(spriteFrame, 1, null);
      animFrames.push(animFrame);
    }

    var animation = cc.Animation.createWithAnimationFrames(animFrames, 0.25);
    var animate = cc.Animate.create(animation);
    this.dosimeter.runAction(animate);
  },
  onEnter: function() {
    this._super();
    this.helpLabel.setOpacity(0);
    this.initial1.setOpacity(0);
    this.initial2.setOpacity(0);
    this.initial3.setOpacity(0);
    this.initial1Highlight.setOpacity(0);
    this.initial2Highlight.setOpacity(0);
    this.initial3Highlight.setOpacity(0);
  },
  onEnterTransitionDidFinish: function() {
    this._super();
    // animate
    setTimeout(this.animate.bind(this), 200);

    setTimeout(this.startListening.bind(this), 1450);
  },
  moveOn: function() {
    cc.audioEngine.playEffect(res.Effect_Selection, false);

    this.blinkOn();
    setTimeout(this.blinkOff.bind(this),100);
    setTimeout(this.blinkOn.bind(this), 200);
    setTimeout(this.blinkOff.bind(this),300);
    setTimeout(this.blinkOn.bind(this), 400);

    if (this.keyboardListener) {
      cc.eventManager.removeListener(this.keyboardListener);
    }
    setTimeout(function() {
      this._callback(this.initials);
    }.bind(this), 500);
  },
  blinkOn: function() {
    this.initial1Highlight.setOpacity(255);
    this.initial2Highlight.setOpacity(255);
    this.initial3Highlight.setOpacity(255);
  },
  blinkOff: function() {
    this.initial1Highlight.setOpacity(0);
    this.initial2Highlight.setOpacity(0);
    this.initial3Highlight.setOpacity(0);
  },
  startListening: function() {
    this.helpLabel.setOpacity(255);
    this.initial1.setOpacity(255);
    this.initial2.setOpacity(255);
    this.initial3.setOpacity(255);
    this.updateSelection();

    // Add event listeners
    if ('keyboard' in cc.sys.capabilities) {
      var keyboardEventListener = cc.EventListener.create({
        event: cc.EventListener.KEYBOARD, /* TODO: Change to touch */
        onKeyPressed: function(keyCode, event) {
          if (keyCode == 13) { // enter
            this.moveOn();
            return;
          }

          if (keyCode == 38 || keyCode == 37 || keyCode == 39 || keyCode == 40) { // enter
            cc.audioEngine.playEffect(res.Effect_Select, false);
          }

          var letterIndex = this.letters[this.selectedLetter];
          if (keyCode == 38) { // keyUp
            letterIndex--;
            if (letterIndex < 0) {
              letterIndex = ALPHABET.length-1;
            }
            this.letters[this.selectedLetter] = letterIndex;
          }

          if (keyCode == 40) { // keyDown
            letterIndex++;
            if (letterIndex > ALPHABET.length-1) {
              letterIndex = 0;
            }
            this.letters[this.selectedLetter] = letterIndex;
          }

          if (keyCode == 37) { // keyLeft
            this.selectedLetter--;
            this.selectedLetter = Math.max(this.selectedLetter, 0);
          }

          if (keyCode == 39) { // keyRight
            this.selectedLetter++;
            this.selectedLetter = Math.min(this.selectedLetter, 2);
          }
          this.updateSelection();

        }.bind(this)
      });
      cc.eventManager.addListener(keyboardEventListener, 1);
      this.keyboardListener = keyboardEventListener;
    }
  },
  updateSelection: function() {
    this.initial1Highlight.setOpacity(0);
    this.initial2Highlight.setOpacity(0);
    this.initial3Highlight.setOpacity(0);

    this.initial1.string = ALPHABET[this.letters[0]].toUpperCase();
    this.initial2.string = ALPHABET[this.letters[1]].toUpperCase();
    this.initial3.string = ALPHABET[this.letters[2]].toUpperCase();

    this.initials = this.initial1.string + this.initial2.string + this.initial3.string;

    switch (this.selectedLetter) {
      case 0:
        this.initial1Highlight.setOpacity(255);
        break;
      case 1:
        this.initial2Highlight.setOpacity(255);
        break;
      case 2:
        this.initial3Highlight.setOpacity(255);
        break;
    }
  }
});
