// English-only rear-view vocabulary and everyday learning missions.
window.BODY_ATLAS_BACK_PARTS=[
["nape","Nape",210,148,"right","Back & shoulders","The back of the neck just below the head.","She placed a cool towel on the nape of her neck.","Look behind the neck."],
["shoulder","Shoulder",161,201,"left","Back & shoulders","The area where the arm connects to the upper torso.","My backpack strap rests on my shoulder.","Where your arm joins the torso."],
["back","Back",233,261,"right","Back & shoulders","The rear of the torso, from the shoulders toward the pelvis.","I carry my backpack on my back.","The broad rear surface of your torso."],
["armpit","Armpit",282,235,"right","Arms","The hollow underneath the shoulder, where your upper arm meets your torso.","I apply deodorant to my armpits.","The hollow under the upper arm."],
["arm","Arm",116,277,"left","Arms","The upper limb extending from the shoulder to the hand.","I raised my arm to wave.","The limb attached to your shoulder."],
["elbow","Elbow",93,332,"left","Arms","The joint between the upper arm and the forearm.","I bent my elbow to lift a cup.","The joint halfway along your arm."],
["small-of-back","Small of the back",210,349,"right","Back & shoulders","The lower part of your back above the buttocks, also called the lower back.","I felt tension in the small of my back.","The lower back above your buttocks."],
["wrist","Wrist",79,393,"left","Arms","The joint that connects the hand to the forearm.","I wear my watch on my wrist.","Between the hand and forearm."],
["buttock","Buttock",247,396,"right","Lower body","One of the two rounded areas at the back of the pelvis.","He bruised one buttock after falling.","One rounded area at the rear of the pelvis."],
["hand","Hand",77,436,"left","Arms","The end of the arm, including palm, fingers and thumb.","I write with my right hand.","You use this to hold a pencil."],
["calf","Calf",249,565,"right","Legs","The muscular back part of the lower leg, below the knee.","My calf feels tight after running.","Behind the shin, below the knee."],
["ankle","Ankle",169,631,"left","Legs","The joint that connects the foot to the lower leg.","I twisted my ankle playing basketball.","The joint just above the foot."],
["heel","Heel",252,664,"right","Legs","The back part of the foot, below the ankle.","The back of my shoe rubs against my heel.","The back of your foot."]
].map(([id,name,x,y,side,group,definition,example,clue])=>({id,name,x,y,side,group,definition,example,clue,view:"back",labelY:y-6}));
window.BODY_ATLAS_BACK_MISSIONS=[
["nape","You feel tension at the rear of your neck, just under your head. Where is it?","Look behind the neck."],
["shoulder","Your backpack strap rests where your arm joins the upper body. Tap that place.","The arm connects to the torso there."],
["back","You put on a backpack. Which part of your body carries it?","The rear surface of the torso."],
["armpit","You apply deodorant underneath your upper arm. Identify the spot.","The hollow under the shoulder."],
["elbow","You bend the joint in the middle of your arm to lift a glass.","The joint between upper arm and forearm."],
["wrist","You fasten a watch where your hand joins your forearm.","Look just before the hand."],
["small-of-back","You feel stiffness at the lower back, above the buttocks.","The rear of your torso above the pelvis."],
["buttock","You sit down on a chair. Identify one of the two rounded areas supporting you.","The back of the pelvis."],
["calf","After running, the muscular back of your lower leg feels sore.","Behind the shin."],
["ankle","You twist the joint connecting your foot and lower leg.","The joint just above the foot."],
["heel","A new shoe rubs the very back of your foot.","The rear of the foot."]
].map(([id,scene,hint])=>({id,scene,hint}));