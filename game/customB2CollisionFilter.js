Engine.initObject("customB2CollisionFilter", "b2CollisionFilter", function() {
    var customB2CollisionFilter = b2CollisionFilter.extend({

        // Return true if contact calculations should be performed between these two shapes
        // Then call custom collisions
        ShouldCollide: function(shape1, shape2){
            if (shape1.m_groupIndex == shape2.m_groupIndex && shape1.m_groupIndex != 0)
            {
                return shape1.m_groupIndex > 0;
            }

            var collide = (shape1.m_maskBits & shape2.m_categoryBits) != 0 && (shape1.m_categoryBits & shape2.m_maskBits) != 0;

            // framechange - added to get notification of collisions
            if(collide == true)
            {
                var gameObject1 = shape1.m_body.gameObject;
                var gameObject2 = shape2.m_body.gameObject;

                if(gameObject1 !== null && gameObject2 !== null)
                    gameObject1.collision(gameObject2);

                if(gameObject1 !== null && gameObject2 !== null)
                    gameObject2.collision(gameObject1);
            }

            return collide;
        }
    }, {

        b2_defaultFilter: null

    });

    b2CollisionFilter.b2_defaultFilter = new b2CollisionFilter();

    return b2CollisionFilter;
});
