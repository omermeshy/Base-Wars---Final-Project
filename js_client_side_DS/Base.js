class Base
{
    constructor(owner, x, y, score, id)
    {
        //the owner blue/red
        this.owner = owner;

        //id
        this.id = owner+":"+id;

        //the top left position on the screen
        this.x = x;
        this.y = y;

        //score of the base
        this.score = score;

        //choose image path
        if(this.owner == "blue")
        {
            this.img = "img/Base1.png";
        }

        else if(this.owner == "red")
        {
            this.img = "img/Base2.png";
        }

        else
        {
            this.img = "img/Base3.png";
        }
    }

    //update the score and replace owner if needed
    //n: number
    UpdateScoreBy(n, plane_color)
    {
        //replace owner
        if(this.score+n < 0)
        {
            if(this.owner == "blue")
            {
                this.owner = "red";
                this.img = "img/Base2.png";
                this.id = "red:" + this.id.split(":")[1];
            }

            else if(this.owner == "red")
            {
                this.owner = "blue";
                this.img = "img/Base1.png";
                this.id = "blue:" + this.id.split(":")[1];
            }

            else
            {
                if(plane_color == "red")
                {
                    this.owner = "red";
                    this.img = "img/Base2.png";
                    this.id = "red:" + this.id.split(":")[1];
                }

                else if(plane_color == "blue")
                {
                    this.owner = "blue";
                    this.img = "img/Base1.png";
                    this.id = "blue:" + this.id.split(":")[1];
                }
            }

            this.score = Math.abs(this.score+n);

            return true;
        }

        //update the score
        else
        {
            this.score+=n;

            return false;
        }
    }

    //get base's score
    GetScore()
    {
        return this.score;
    }

	//get base's position
	GetPosition()
    {
        return [this.x, this.y];
    }

    //get base's image path
    GetBase()
    {
        return this.img;
    }

    //get base's owner
    GetOwner()
    {
        return this.owner;
    }

    //get base's id
    GetId()
    {
        return this.id;
    }
}

