# Dosimetron

I was contracted to create Dosimetron, an old-school-inspired arcade game, to market a
new product for Landauer, a Chicago area radiology equipment manufacturing concern. The game was launched in a physical arcade machine, as well as on iOS and Android, but written in Javascript.

A little background: While my CS program at DePaul did introduce me to game theory, the basics of sprite-based games, and OpenGL, I've never been a game programmer. I've stuck mostly to web development; Dosimetron was my first shipped game, and also my first time using Cocos2D. In fact, I had wanted to use Unity, which I was somewhat familiar with, but had to change to Cocos after licensing issues.

Therefore, Dosimetron is a great example of figuring something out as I went, and still shipping on time! I am sharing a few files in this folder. They all use Cocos2D, something that is woefully underdocumented and meant I had to really push to understand the code while using a very flawed IDE (Cocos Studio). What I ended up with was not perfect, by any means - this was literally the first collision system I've shipped (not the first time I've ever thought about the problem, but close) - but I'm really proud of what I was able to create in the face of my unfamiliarity with games and with a single designer in less than 120 hours of development time.

### Files

A smattering of the most 'standalone' files from the repository are here. I can give access to the Dosimetron repository,
https://github.com/colinyoung/dosimetron, upon request.

These files will probably make more sense after you play* Dosimetron itself:

([App Store](https://itunes.apple.com/us/app/dosimetron/id1059172279?mt=8), [Play Store](https://play.google.com/store/apps/details?id=com.landauer.dosimetron))

- [proton.js](machine.js)
- [rect.js](machine.js)
- [machine.js](machine.js)
- [name_entry.js](machine.js)

* CAVEAT: The leaderboard in this mobile game depends on a server that I am not responsible for and may or may not still be live.
