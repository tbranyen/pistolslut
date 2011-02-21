Engine.include("/objects/object.physicsactor.js");

Engine.initObject("PhysicsObject", "PhysicsActor", function() {
	var PhysicsObject = PhysicsActor.extend({
		sprites: {},
		currentSpriteKey: null,
		renderScale: 1,
	    worldPos: null,

		constructor: function(name) {
			this.base(name);
		    this.worldPos = Point2D.create(0,0);

			// Create the physical body object which will move the toy object
			this.createPhysicalBody("physics", this.renderScale);
			this.getComponent("physics").setScale(this.renderScale);
		},

		createPhysicalBody: function(componentName, scale) { },

		applyForce: function(amt, loc) {
			this.getComponent("physics").applyForce(amt, loc);
		},

        getViewPosition: function() {
		    this.worldPos.set(this.getPosition());
		    this.worldPos.sub(PistolSlut.renderContext.getWorldPosition());
            return this.worldPos;
        },

        setPosition: function(point) {
            this.base(point);
            this.getComponent("physics").setPosition(point);
        },

        getVelocity: function() { return this.getPhysicsBody().m_linearVelocity; },

	    setSprite: function(spriteKey) {
			if(spriteKey != this.currentSpriteKey)
			{
                //console.log(spriteKey)
			    var newSprite = this.sprites[spriteKey];
				if(this.currentSpriteKey != null)
				{
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

        getPhysicsBody: function() { return this.getComponent("physics").body; },
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