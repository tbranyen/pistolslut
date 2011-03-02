Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.keyboardinput.js");
Engine.include("/engine/engine.object2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.timers.js");
Engine.include("/components/component.sprite.js");
Engine.include("/components/component.boxbody.js");

Engine.initObject("Human", "PhysicsObject", function() {
	var Human = PhysicsObject.extend({
		field: null,
        boxSize: null,

		weapon: null,
		grenadeLauncher: null,

		stateOfBeing: null,
		health: -1,
		standState: null,
     	grenadeThrower: false,
		direction: null,
        spotter: null,
        shooter: null,

		constructor: function(name, field, position, health, weapons, grenadeThrower) {
			this.base(name);
            this.field = field;
			this.health = health;
            this.maxHealth = health;
			this.grenadeThrower = grenadeThrower;
			this.stateOfBeing = Human.ALIVE;
			this.standState = Human.STANDING;

            this.setupWeapons(weapons);
			this.loadSprites();

			this.createPhysicalBody(Point2D.create(46, 41), position);
            this.setGameObjectReference();

			this.updateSprite();
		},

		createPhysicalBody: function(dimensions, position) {
            if(!this.getPhysicsComponent())
            {
			    this.add(BoxBodyComponent.create("physics", dimensions)); // old gets auto removed if present
                this.getPhysicsComponent().setRenderComponent(SpriteComponent.create("draw"));
                this.setPosition(position);
                this.setSimulation(this.field.simulation);
            }
            else
            {
                this.stopSimulate();

                this.setPosition(position);
		        var dimensions = Point2D.create(dimensions);
		        var e = dimensions.get();
		        this.getPhysicsComponent().getShapeDef().extents.Set(e.x / 2, e.y / 2);
		        this.getPhysicsComponent().setLocalOrigin(e.x / 2, e.y / 2);
            }

			this.boxSize = dimensions;
            var physicsComponent = this.getPhysicsComponent();
			physicsComponent.setFriction(0.3);
			physicsComponent.setRestitution(0);
			physicsComponent.setDensity(2);
            physicsComponent.getBodyDef().preventRotation = true;

            this.simulate();
		},

		update: function(renderContext, time) {
			this.move(time);
			renderContext.pushTransform();
			this.base(renderContext, time);
			renderContext.popTransform();

			this.weapon.handleReload(time);
			this.weapon.handleAutomatic(time);
			this.weapon.handleDischarge(time);
            this.grenadeLauncher.handleDischarge(time);
		},

		move: function(time) {
			if(this.getSprite().isSinglePlayOver(time) == true) // on a single play anim and it's over
			{
				if(this.stateOfBeing == Human.DYING)
					this.stateOfBeing = Human.DEAD;

				if(this.weapon.isShooting())
					this.weapon.stopShooting();
			}

			this.updateSprite();
		},

		canStand: function() { return this.weapon.canStand(); },

		getStandState: function() { return this.standState; },

		getMoveState: function() {
            if(this.isCrouching() || this.getVelocity().x == 0)
				return Human.STILL;
			else
				return Human.RUNNING;
		},

		die: function(ordinance) {
            this.unsetSpotter();
			this.stateOfBeing = Human.DYING;
			this.setSprite(this.direction + Human.DYING + this.weapon.name);
		},

		shoot: function() {
			this.weapon.shoot();
			this.updateSprite();
		},

		crouch: function() {
			if(!this.isCrouching())
			{
				this.standState = Human.CROUCHING;
				this.stopWalk();
			}
		},

		stand: function() {
			if(this.isCrouching())
			{
				this.standState = Human.STANDING;
				this.stopWalk();
			}
		},

		// delay on when human lowers their gun
		delayBeforeLoweringGun: 400,
		lastStoppedShooting: 0,
		getShootState: function() {
			if(this.weapon.shooting == Weapon.SHOOTING)
				return Weapon.SHOOTING;
			else
			{
				if(new Date().getTime() - this.lastStoppedShooting > this.delayBeforeLoweringGun)
					return Weapon.NOT_SHOOTING;
				else
					return Weapon.SHOOTING;
			}
		},

		stoppedShooting: function() { this.lastStoppedShooting = new Date().getTime(); },

		throwGrenade: function(distance) {
            this.grenadeLauncher.shoot(distance);
			this.field.notifier.post(GrenadeLauncher.THROW, this.grenadeLauncher);
        },

        firingAnotherWeapon: function(weapon) {
            if(this.grenadeLauncher.isShooting() && weapon.id != this.grenadeLauncher.id)
                return true;
            else
            {
                for(var i in this.weapons)
                    if(this.weapons[i].isShooting() && this.weapons[i].id != weapon.id)
                        return true;
            }

            return false;
        },

		cycleWeapon: function() {
			if(this.weapons.length == 0)
				return;

			for(var i = 0; i < this.weapons.length; i++)
				if(i == this.weapons.length - 1)
					this.setWeapon(this.weapons[0].name);
				else if(this.weapons[i] == this.weapon)
				{
					this.setWeapon(this.weapons[i + 1].name);
					break;
				}

			this.field.notifier.post(Weapon.SWITCH, this.weapon);
            this.weapon.updateMeters();
			this.updateSprite();
		},

		setWeapon: function(weaponName) {
			for(var i in this.weapons)
				if(this.weapons[i].name == weaponName)
				{
					this.weapon = this.weapons[i];
					this.weapon.setPose();
				}
		},

		jump: function() {
			if(!this.isJumping() && !this.isCrouching())
			{
				this.jumping = true;
                this.getPhysicsComponent().wakeUp();
                this.getPhysicsBody().m_linearVelocity.y = Human.JUMP_SPEED;
			}
		},

		jumping: false,
        isJumping: function() {
            return !this.getPhysicsBody().m_linearVelocity.y == 0;
        },

		turn: function(direction) {
            if(this.walking == true)
                this.stopWalk();

            this.direction = direction;
        },

		walking: false,
		walk: function(direction) {
			if(!this.walking && !this.isCrouching())
			{
				this.walking = true;
				this.direction = direction;
                this.getPhysicsComponent().wakeUp();
				if(direction == Collider.LEFT)
					this.getPhysicsBody().m_linearVelocity.x = -Human.WALK_SPEED;
			    else if(direction == Collider.RIGHT)
				    this.getPhysicsBody().m_linearVelocity.x = Human.WALK_SPEED;
			}
		},

		stopWalk: function() {
			this.getPhysicsBody().m_linearVelocity.x = 0;
			this.walking = false;
		},

		shot: function(ordinance) {
			if(this.isAlive() || this.isDying())
			{
				//this.bloodSpurt(ordinance);
                if(this.isAlive())
                {
                    this.field.notifier.post(Human.SHOT, this);
				    this.health -= ordinance.damage;
				    if(this.health <= 0)
					    this.die(ordinance);
                }
			}
		},

		bloodSpread: 50,
		bloodParticleCount: 10,
		bloodParticleTTL: 300,
		bloodSpurt: function(projectile) {
			var positionData = this.field.collider.pointOfImpact(projectile, this);
			var position = null;
			if(positionData != null)
				var position = Point2D.create(positionData[0].x, positionData[0].y)

			if(position)
			{
				var particles = [];

				var sideHit = positionData[1];
				var reversedAngle = this.field.physics.reverseAngle(projectile, sideHit);
				for(var x = 0; x < this.bloodParticleCount; x++)
					particles[x] = BloodParticle.create(position, reversedAngle, this.bloodSpread, this.bloodParticleTTL);

				this.field.pEngine.addParticles(particles);
			}
		},

		setupWeapons: function(weapons) {
            this.weapons = [];
            for(var i in weapons)
                this.weapons.push(eval("new " + weapons[i] + "(this)"));

            this.setWeapon(this.weapons[0].name);
			this.grenadeLauncher = new GrenadeLauncher(this);
		},

		onCollide: function(obj) {
			if(obj instanceof Furniture && this.field.collider.objsColliding(this, obj))
			{
				if(this.field.collider.aFallingThroughB(this, obj))
					this.endFall(obj);
				else if(this.field.collider.aOnBottomAndBumpingB(this, obj))
					this.endRise(obj);
				else if(this.field.collider.aOnLeftAndBumpingB(this, obj))
					this.block(obj.getPosition().x - this.getBoundingBox().dims.x - 1);
				else if(this.field.collider.aOnRightAndBumpingB(this, obj))
					this.block(obj.getPosition().x + obj.getBoundingBox().dims.x + 1);
			}
            else if(obj instanceof Barrel && this.field.collider.objsColliding(this, obj))
            {
				if(this.field.collider.aFallingThroughB(this, obj))
					this.endFall(obj);
				else if(this.field.collider.aOnBottomAndBumpingB(this, obj)) // unlikely
					this.endRise(obj);
				else if(this.field.collider.aOnLeftAndBumpingB(this, obj))
					this.block(obj.getPosition().x - this.getBoundingBox().dims.x);
				else if(this.field.collider.aOnRightAndBumpingB(this, obj))
					this.block(obj.getPosition().x + obj.getBoundingBox().dims.x);
            }
			else if(obj instanceof Ordinance)
				this.field.notifier.post(Human.INCOMING, obj);

			return ColliderComponent.CONTINUE;
		},


        isSpotter: function() { return this.shooter !== null; },
        hasSpotter: function() { return this.spotter !== null; },
        setSpotter: function(spotter) {
            this.spotter = spotter;
            spotter.shooter = this;
        },

        unsetSpotter: function() {
            if(this.hasSpotter())
            {
                this.spotter.shooter = null;
                this.spotter = null;
            }
            else if(this.isSpotter())
            {
                this.shooter.spotter = null;
                this.shooter = null;
            }
        },

		// sets sprite to reflect whatever human is doing
		updateSprite: function() {
			if(this.isSpotter())
                this.setSprite(this.direction + Human.SPOTTING);
            else if(this.isAlive() && (this.grenadeLauncher.isShooting() || this.grenadeLauncher.isAnimating()))
                this.setSprite(this.direction + this.getStandState() + this.grenadeLauncher.name);
            else if(this.isAlive())
				this.setSprite(this.direction + this.getStandState() + this.getMoveState() + this.getShootState() + this.weapon.name);
			else if(this.stateOfBeing == Human.DEAD)
				this.setSprite(this.direction + Human.DEAD + this.weapon.name);
		},

		loadSprites: function() {
			for(var spriteIdentifier in this.field.spriteLoader.get("human").info.sprites)
				this.addSprite(spriteIdentifier, this.field.spriteLoader.getSprite("human", spriteIdentifier));
		},

		isAlive: function() { return this.stateOfBeing == Human.ALIVE; },
        isDying: function() { return this.stateOfBeing == Human.DYING; },
		isCrouching: function() { return this.standState == Human.CROUCHING; },

		getGunAngle: function() { return Human.COORDINATES[this.direction][this.standState][this.weapon.name]["gunAngle"]; },
		getRelativeGunTip: function(weaponName) { return Human.COORDINATES[this.direction][this.standState][weaponName]["gunTip"]; },

		release: function() {
			this.base();
			this.stateOfBeing = null;
			this.health = -1;
			this.weapon = null;
			this.weapons = null;
		},
	}, {
		getClassName: function() { return "Human"; },

		WALK_SPEED: 500,
        JUMP_SPEED: -250,

		// states of being
		ALIVE: "Alive",
		DYING: "Dying",
		DEAD: "Dead",

        HUMAN: "Human",
        ENEMY: "Enemy",

        SPOTTING: "Spotting",

		// standing state
		STANDING: "Standing",
		CROUCHING: "Crouching",

		RUNNING: "Running",
		STILL: "Still",

		RELOADED: "Reloaded",
		SHOT: "shot",
		INCOMING: "incoming",
		GRENADE_NEARBY: "grenade_nearby",
		NO_NEARBY_GRENADES: "no_nearby_grenades",

		COORDINATES: {
			"Left": {
			 	"Standing": {
					"GrenadeLauncher": { "gunTip": new Point2D(5, -29),  "gunAngle": 330 },
					"M9": 	           { "gunTip": new Point2D(-30, -14), "gunAngle": 270 },
					"Mac10":           { "gunTip": new Point2D(-30, -15), "gunAngle": 270 },
					"SPAS":            { "gunTip": new Point2D(-30, -12), "gunAngle": 270 }
				},
				"Crouching": {
					"GrenadeLauncher": { "gunTip": new Point2D(-10, -20),  "gunAngle": 330 },
					"M9": 	           { "gunTip": new Point2D(-30, -08), "gunAngle": 270 },
					"Mac10":           { "gunTip": new Point2D(-27, -11), "gunAngle": 270 },
					"SPAS":            { "gunTip": new Point2D(-27, -07), "gunAngle": 270 },
					"Mortar":          { "gunTip": new Point2D(-27, -07), "gunAngle": 345 },
				}
			},
			"Right": {
				"Standing": {
					"GrenadeLauncher": { "gunTip": new Point2D(10, -29),  "gunAngle": 30 },
					"M9": 	           { "gunTip": new Point2D(30, -14), "gunAngle": 90 },
					"Mac10":           { "gunTip": new Point2D(25, -17), "gunAngle": 90 },
					"SPAS":            { "gunTip": new Point2D(25, -12), "gunAngle": 90 },
				},
				"Crouching": {
					"GrenadeLauncher": { "gunTip": new Point2D(10, -20),  "gunAngle": 30 },
					"M9":              { "gunTip": new Point2D(30, -10), "gunAngle": 90 },
					"Mac10":           { "gunTip": new Point2D(30, -11), "gunAngle": 90 },
					"SPAS":            { "gunTip": new Point2D(30, -07), "gunAngle": 90 },
					"Mortar":          { "gunTip": new Point2D(30, -07), "gunAngle": 15 },
				}
			}
		},
	});

	return Human;
});