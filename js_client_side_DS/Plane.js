class Plane
{
    constructor(owner, score, StartingBase, TargetBase)
    {
        //owner blue/red
        this.owner = owner;

        //score
        this.score = score;

        //starting base
        this.StartingBase = StartingBase;

        //target base (destenation)
        this.TargetBase = TargetBase;

        //speed of movment
        this.speed = 0.025;

        //x, y location on the screen
        this.x = StartingBase.GetPosition()[0] + 0.1;
        this.y = StartingBase.GetPosition()[1] + 0.05;

        //choose image path
        if(owner == "blue")
        {
            this.img = "img/Plane1.png";
        }

        else
        {
            this.img = "img/Plane2.png";
        }
    }

    //get the angle of the plane from the target
    GetAngle()
    {
        var pos = this.TargetBase.GetPosition();
        var tx = pos[0] - this.x + 0.05;
        var ty = pos[1] - this.y + 0.025;
        var rad = Math.atan2(ty,tx);
        var angle = rad/Math.PI * 180;

        return angle + 90;
    }

    //get the plane's image path
    GetPlane()
    {
        return this.img;
    }

    //update the plane's position and check if got to the target (return true;)
    UpdatePosition()
    {
        var pos = this.TargetBase.GetPosition();

        //check if got to the target
        if((pos[0]-0.05 < this.x) && (this.x-0.01 < pos[0] + 0.11) &&
           ((pos[1]-0.05 < this.y) && (this.y-0.001 < pos[1] + 0.09)))
        {
            return true;
        }

        //check if went an error
        else if(this.x > 1 || this.x < 0 || this.y > 1 || this.y < 0)
        {
            return "error";
        }

        //update posion
        else
        {
            var tx = pos[0] - this.x + 0.05;
            var ty = pos[1] - this.y + 0.025;
            var dist = Math.sqrt(tx*tx+ty*ty);

            var velX = (tx/dist)*this.speed;
            var velY = (ty/dist)*this.speed;

            this.x += velX;
            this.y += velY;
        }
    }

    //get plane's position
    GetPosition()
    {
        return [this.x, this.y];
    }

    //get plane's target base
    GetTargetBase()
    {
        return this.TargetBase;
    }

    //get plane's start base
    GetStartingBase()
    {
        return this.StartingBase;
    }

    //get plane's score
    GetScore()
    {
        return this.score;
    }

    //get plane's owner
    GetOwner()
    {
        return this.owner;
    }
}
