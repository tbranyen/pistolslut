Engine.initObject("M9", "Weapon", function() {
	var M9 = Weapon.extend({

		constructor: function(owner) {
			this.clipCapacity = 10;
			this.base(M9.getClassName(), owner, owner.field);

			this.automatic = Weapon.SEMI_AUTOMATIC;
			this.roundsPerMinute = 180;
			this.projectilesPerShot = 1;
			this.timeToReload = 1000;
			this.projectileVelocityVariability = 0.1;
			this.dischargeDelay = 0;
			this.timeRequiredForDeadAim = 1000;
			this.ordinanceBaseSpeed = 10 * Weapon.VELOCITY_BOOST;
            this.hasMuzzleFlash = false;
		},

		ordinancePhysics: function() {
			return this.recoil(M9.BASE_SPREAD, M9.UNSTEADINESS).mul(this.ordinanceSpeed(this.ordinanceBaseSpeed, this.projectileVelocityVariability));
		},

		generateOrdinance: function() { return Bullet.create(this); },

	}, {
		getClassName: function() { return "M9"; },

		UNSTEADINESS: 3,
		BASE_SPREAD: 2,
	});

	return M9;
});