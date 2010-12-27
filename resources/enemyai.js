{
    identifier: "idle", strategy: "prioritised",
    children: [
        {
            identifier: "fight", strategy: "prioritised",
            children: [
                { identifier: "throwGrenade" },
                { identifier: "shoot" },
                {
                    identifier: "reload", strategy: "sequential",
                    children: [
                        { identifier: "crouch" },
                        { identifier: "reload" },
                    ]
                },
                { identifier: "stand" },
            ]
        }
    ]
}