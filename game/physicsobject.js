Engine.include("/objects/object.physicsactor.js");

Engine.initObject("PhysicsObject", "PhysicsActor", function() {
	var PhysicsObject = PhysicsActor.extend({
		sprites: {},
		currentSpriteKey: null,
		renderScale: 1,

		constructor: function(name) {
			this.base(name);

			// Create the physical body object which will move the toy object
			this.createPhysicalBody("physics", this.renderScale);
			this.getComponent("physics").setScale(this.renderScale);
		},

		createPhysicalBody: function(componentName, scale) { },

        updatePhysicalBodySize: function() {
            var bBoxDims = this.getSprite().getBoundingBox().dims;
            this.getComponent("physics").getShapeDef().extents.Set(bBoxDims.x / 2, bBoxDims.y / 2);
        },

        getVelocity: function() { return this.getPhysicsBody().m_linearVelocity; },

	    setSprite: function(spriteKey) {
			if(spriteKey != this.currentSpriteKey)
			{
                //console.log(spriteKey)
			    var newSprite = this.sprites[spriteKey];
				if(this.currentSpriteKey != null)
				{1
					var heightAdjustment = this.getSprite().getBoundingBox().dims.y - newSprite.getBoundingBox().dims.y;
					if(heightAdjustment != 0)
						this.getPosition().setY(this.getPosition().y + heightAdjustment);
				}

			    this.setBoundingBox(newSprite.getBoundingBox());
                this.getDrawComponent().setSprite(newSprite);

				newSprite.play(Engine.worldTime);
				this.currentSpriteKey = spriteKey;
			}
	    },

		getSprite: function() {
			return this.getDrawComponent().getSprite();
		},

		addSprite: function(name, sprite) {
			this.sprites[name] = sprite;
		},

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