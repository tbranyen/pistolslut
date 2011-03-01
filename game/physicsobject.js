Engine.include("/objects/object.physicsactor.js");

Engine.initObject("PhysicsObject", "PhysicsActor", function() {
	var PhysicsObject = PhysicsActor.extend({
		sprites: {},
		currentSpriteKey: null,
		renderScale: 1,

		constructor: function(name) {
			this.base(name);
		},

        getVelocity: function() {
            if(this.getPhysicsComponent())
                return this.getPhysicsBody().m_linearVelocity;
            else
                return 0;
        },

	    setSprite: function(spriteKey) {
			if(spriteKey != this.currentSpriteKey)
			{
				this.currentSpriteKey = spriteKey;
			    var newSprite = this.sprites[this.currentSpriteKey];

                var oldSprite = null;
                if(this.alreadyHasPhysicsBody())
                    oldSprite = this.getSprite();

                if(oldSprite)
                {
                    var oldBBoxDims = oldSprite.getBoundingBox().dims;
                    var newBBoxDims = newSprite.getBoundingBox().dims;
                    if(oldBBoxDims.x != newBBoxDims.x || oldBBoxDims.y != newBBoxDims.y)
                    {
                        var dimensions = Point2D.create(newBBoxDims.x, newBBoxDims.y);
                        var curPos = this.getPosition();
                        var newPos = Point2D.create(curPos.x + ((oldBBoxDims.x - newBBoxDims.x) / 2), curPos.y + ((oldBBoxDims.y - newBBoxDims.y) / 2));
                        this.createPhysicalBody(dimensions, newPos);
                    }
                }

			    this.setBoundingBox(newSprite.getBoundingBox());
                this.getDrawComponent().setSprite(newSprite);

				newSprite.play(Engine.worldTime);
			}
	    },

		getSprite: function() {
			return this.getDrawComponent().getSprite();
		},

		addSprite: function(name, sprite) {
			this.sprites[name] = sprite;
		},

        alreadyHasPhysicsBody: function() { return this.getPhysicsComponent() !== undefined; },
        getPhysicsComponent: function() { return this.getComponent("physics"); },
        getPhysicsBody: function() { return this.getPhysicsComponent().body; },
        getDrawComponent: function() { return this.getComponent("physics").getRenderComponent(); },

		release: function() {
			this.base();
			this.sprites = {};
			this.currentSpriteKey = null;
		},

	}, {
		getClassName: function() { return "PhysicsObject"; },
	});

	return PhysicsObject;
});