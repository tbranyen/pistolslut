Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Furniture", "PhysicsObject", function() {
	var Furniture = PhysicsObject.extend({
		field: null,

		constructor: function(name) {
			this.base(name);
			this.field = PistolSlut;
		},

		update: function(renderContext, time) {
			renderContext.pushTransform();
			this.base(renderContext, time);
			renderContext.popTransform();
		},

		shot: function(projectile) {
			this.particleRicochet(projectile);
		},

		ricochetFlashSpread: 10,
		ricochetParticleCount: 10,
		ricochetParticleTTL: 300,
        ricochetBaseSpeed: 1,
		particleRicochet: function(projectile) {
			var positionData = this.field.collider.pointOfImpact(projectile, this);
			if(positionData != null)
			{
				var particles = [];
				for(var x = 0; x < this.ricochetParticleCount; x++)
					particles[x] = BurnoutParticle.create(Point2D.create(positionData[0].x, positionData[0].y),
														  this.field.physics.reverseAngle(projectile, positionData[1]), // reversed angle
														  this.ricochetFlashSpread,
														  this.ricochetParticleTTL,
                                                          this.ricochetBaseSpeed);

				this.field.pEngine.addParticles(particles);
			}
		},

	}, {
		getClassName: function() { return "Furniture"; },

	});

	return Furniture;
});