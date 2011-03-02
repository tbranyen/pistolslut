/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*
* Converted for The Render Engine v2.0
* Aug. 4, 2010 Brett Fattori
*/

Engine.include("/physics/common/b2Settings.js");
Engine.include("/physics/common/math/b2Vec2.js");


Engine.initObject("b2CollisionFilter", null, function() {

   var b2CollisionFilter = Base.extend({

      constructor: function() {

      },

      // Return true if contact calculations should be performed between these two shapes.
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
              if(gameObject1 !== null)
                  gameObject1.collision(gameObject2);

              if(gameObject2 !== null)
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
