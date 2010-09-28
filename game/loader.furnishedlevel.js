Engine.include("/engine/engine.math2d.js");
Engine.include("/engine/engine.pooledobject.js");
Engine.include("/resourceloaders/loader.image.js");

Engine.initObject("FurnishedLevelLoader", "LevelLoader", function() {
	var FurnishedLevelLoader = LevelLoader.extend(/** @scope FurnishedLevelLoader.prototype */{
		
		spriteLoader: null,
		
		constructor: function(name, spriteLoader) {
			this.base(name || "FurnishedLevelLoader");
			this.spriteLoader = spriteLoader;
		},

		load: function(name, url, info, path) {
			if (url)
			{
				var loc = window.location;
				if (url.indexOf(loc.protocol) != -1 && url.indexOf(loc.host) == -1) {
					Assert(false, "Levels must be located on this server");
				}

				var thisObj = this;

				// Get the file from the server
				$.get(url, function(data) {
					var levelInfo = EngineSupport.evalJSON(data);

					// get the path to the resource file
					var path = url.substring(0, url.lastIndexOf("/"));
					thisObj.load(name, null, levelInfo, path + "/");
				});
			}
			else
			{
				this.base(name, url, info, path); // let the super do its thing
				
				// now load all the sprites for the furniture
				var levelObjects = info.objects;
				for(var i in levelObjects.furniture)
				{
					var furniturePieceData = levelObjects.furniture[i];					
					this.spriteLoader.load(furniturePieceData.name, null, furniturePieceData.sprite, path);
				}
				
				// load parallax data
				for(var i in levelObjects.parallaxes)
				{
					var data = levelObjects.parallaxes[i];
					this.spriteLoader.load(data.name, null, data.sprite, "resources/");
				}
			}
		},

		get: function(name) {
			var level = this.base(name);
			level.furniture = this.levels[name].furniture;
			level.enemies = this.levels[name].enemies;
			return level;
		},

		getLevel: function(levelName, field, fieldWidth) {
			return FurnishedLevel.create(levelName, field, this.get(levelName), fieldWidth);
		},

		getResourceType: function() { return "furnishedLevel"; }
	}, {
		
		getClassName: function() { return "FurnishedLevelLoader"; }
	});

	return FurnishedLevelLoader;
});

Engine.initObject("FurnishedLevel", "Level", function() {
	
	var FurnishedLevel = Level.extend({
		
		field: null,
		frameCheapRect: null, // world coords of level frame
		triggers: {},
		triggerableObjects: {},
		signs: [],
		furniture: [],
		enemies: [],
		fires: [],
		fireworkLaunchers: [],
		parallaxes: [],
		parallaxesToMove: [],
		lanterns: [],
		sky: null,
		speeches: [],
		
		snowTimer: null,
		snowFallInterval: 50,
		
		wind: 0,
		
		minScroll: 0,
		maxScroll: null,
		levelResource: null,

	  constructor: function(name, field, levelResource, fieldWidth) {
			var level = this.base(name, levelResource);
			this.field = field;
			this.frameCheapRect = new CheapRect(null, 0, 0, this.getWidth(), this.getHeight());
			this.levelResource = levelResource;
			this.maxScroll = this.getWidth() - fieldWidth;
			this.wind = FurnishedLevel.BASE_WIND + (FurnishedLevel.RANDOMISED_WIND * Math.random());
			
			return level;
		},
		
		liveEnemies: function() {
			var liveEnemies = [];
			for(var i in this.enemies)
				if(this.enemies[i].isAlive())
					liveEnemies.push(this.enemies[i]);

			return liveEnemies;
		},

		addObjects: function(renderContext) {
			this.addFurniture(renderContext);
			this.addEnemies(renderContext);
			this.addSigns(renderContext);
			this.addFires();
			this.addFireworkLaunchers(renderContext);
			//this.addSnow();
			this.addSky(renderContext);
			this.addParallaxes(renderContext);
			this.addLanterns(renderContext);
			this.addSpeeches(renderContext);
			this.addTriggers(); // must be called last so that all the triggerable objs have been added to this.triggerableObjects
		},

		// creates Furniture render objects for each piece of furniture loaded from
		// level def file and adds them to the renderContext
		addFurniture: function(renderContext) {
			var data = this.levelResource.info.objects.furniture;
			for(var i in data)
			{
				var furniturePiece = Furniture.create(data[i].name, Point2D.create(data[i].x, data[i].y));
				this.furniture[i] = furniturePiece;
				renderContext.add(furniturePiece);
			}
		},
				
		// creates Enemy render objects for each piece of furniture loaded from
		// level def file and adds them to the renderContext
		addEnemies: function(renderContext) {
			data = this.levelResource.info.objects.enemies;
			for(var i in data)
			{
				var enemy = eval(data[i].clazz).create(data[i].name,
																							 this.field,
																							 Point2D.create(data[i].x, data[i].y),
																							 data[i].health,
																							 data[i].weaponName,
																							 data[i].canThrowGrenades);
				this.enemies[i] = enemy;
				renderContext.add(enemy);
			}
		},

		// load signs from the current level
		addSigns: function(renderContext) {
			var data = this.levelResource.info.objects.signs;
			var signs = data.items;
			for(var i in data.items)
			{
				this.signs[i] = new Sign(this.field, signs[i].text, data.color, Point2D.create(signs[i].x, signs[i].y), signs[i].width, data.letterSpacing);
				renderContext.add(this.signs[i]);
				// this.field.notifier.subscribe(Human.CLIP_EMPTY, this.signs[i], this.signs[i].notifyWeaponEmpty);
				// this.field.notifier.subscribe(Human.RELOADED, this.signs[i], this.signs[i].notifyReloaded);
				// this.field.notifier.subscribe(Weapon.SWITCH, this.signs[i], this.signs[i].notifyWeaponSwitch);
				// this.field.notifier.subscribe(Human.GRENADE_NEARBY, this.signs[i], this.signs[i].notifyGrenadeNearby);
				// this.field.notifier.subscribe(Human.NO_NEARBY_GRENADES, this.signs[i], this.signs[i].notifyNoNearbyGrenades);
			}
		},
		
		addFires: function() {
			var data = this.levelResource.info.objects.fires;
			for(var i in data)
				this.fires[i] = new Fire(data[i].name, this.field, data[i].x, data[i].y, data[i].width);	
		},
		
		addFireworkLaunchers: function(renderContext) {
			var data = this.levelResource.info.objects.fireworkLaunchers;
			for(var i in data)
				this.fireworkLaunchers[i] = new FireworkLauncher(data[i].name, this.field, renderContext, data[i].x, data[i].y, data[i].angle, data[i].spread, data[i].interval);
		},
		
		numberOfLanterns: 10,
		addLanterns: function(renderContext) {
			for(var i = 0; i < this.numberOfLanterns; i++)
			{
				this.lanterns[i] = new Lantern(this.field, this.wind, this.field.fieldWidth, this.field.fieldHeight);
				renderContext.add(this.lanterns[i]);
			}
		},
		
		addSnow: function() {
			var level = this;
			this.snowTimer = Interval.create("snow", this.snowFallInterval,
				function() {
					level.field.pEngine.addParticle(SnowParticle.create(level.getWidth()));
			});
		},
		
		addSpeeches: function(renderContext) {
			var data = this.levelResource.info.objects.speeches;
			var speeches = data.items;
			for(var i in speeches)
			{
				this.speeches[i] = new Speech(this.field, speeches[i].text, data.lineSpacing, speeches[i].x, speeches[i].b, speeches[i].width, data.color);
				this.addToTriggerableObjects(this.speeches[i], speeches[i]);
				renderContext.add(this.speeches[i]);
			}
		},
		
		addSky: function(renderContext) {
			var data = this.levelResource.info.objects.sky;
			this.sky = new Sky(data.startColor, data.transformations, renderContext);
		},

		addParallaxes: function(renderContext) {
			var data = this.levelResource.info.objects.parallaxes;
			var zIndex = Parallax.START_Z_INDEX;
			for(var i in data)
			{
				var parallax = new Parallax(data[i].name, this.field, zIndex, data[i].scrollAttenuation, data[i].x, data[i].y);
				this.parallaxes.push(parallax);
				if(parallax.scrollAttenuation != 0) // only want to iterate through parallaxes that actually move
					this.parallaxesToMove.push(parallax);
					
				renderContext.add(this.parallaxes[i]);
				zIndex += 1;
			}
		},
		
		addTriggers: function() {
			this.field.notifier.subscribe(Player.MOVE_EVENT, this, this.checkTrigger);
			var data = this.levelResource.info.objects.triggers;
			for(var i in data)
				this.triggers[data[i].x] = new Trigger(data[i].triggerFunctionName, this.triggerableObjects[data[i].identifier]);
		},
		
		// objs added can then be run by triggers in the level e.g.:
		// trigger - { id: "speechMortarGuy", text: "Oh no she's here. Opening fire.", x: 395, b: 480, width: 100 }
		// obj     - { id: "speechMortarGuy", x: 400, call: show }
		// yes, you can't have more than one trigger at the same x
		addToTriggerableObjects: function(obj, objData) { 
			this.triggerableObjects[objData.identifier] = obj;
		},

		// player has moved so run an appropriate trigger if one exists
		checkTrigger: function(playerObj) { 
			//console.log(playerObj.getPosition().x, this.triggers[playerObj.getPosition().x] == undefined)
			if(this.triggers[playerObj.getPosition().x] != undefined) // there is a trigger for this x
				this.triggers[playerObj.getPosition().x].trigger(); // run that bitch
		},

		inLevel: function(obj) {
			return this.frameCheapRect.isIntersecting(new CheapRect(obj));
		},

		release: function() {
			this.base();
			this.field = null;
			this.triggers = {};
			this.triggerableObjects = {};
			this.signs = [];
			this.furniture = [];
			this.enemies = [];
			this.fires = [];
			this.fireworkLaunchers = [];
			this.parallaxes = [];
			this.minScroll = 0;
			this.maxScroll = null;
			this.levelResource = null;
			this.sky = null;
			this.speeches = [];
		},
	}, {
		getClassName: function() { return "FurnishedLevel"; },
		
		BASE_WIND: -0.5,
		RANDOMISED_WIND: -0.5,
	});

	return FurnishedLevel;
});