class AI_Board
{
    constructor(lay, width, hight, x, y)
    {
        //the width of the game area
        this.width = width;

        //the height of the game area
        this.height = hight;

        //the top left position on the screen
        this.x = x;
        this.y = y;

        //is the player alive (didn't lose)
        this.isPlaying = true;

        //array of the selected base and base which is the target (max 2)
        this.selected_bases = [];

        //array of all the bases
        this.bases = [];

        this.blue_bases = [];
        this.red_bases = [];
        this.neutral_bases_bases = [];

        //array of all the planes
        this.planes = [];

        //flag for important changes that the ai_board have to be update
        this.important_change = false;

        //the last time that the score changed (every 1 sec)
        this.last_time_score = Date.now();

        //the last time that the planes changed locating (every 0.5 sec)
        this.last_time_planes = Date.now();

        //create a blank image for the bases.
    	this.img_bases = app.CreateImage( null, this.width, this.height );
    	this.img_bases.SetPosition(this.x, this.y);
    	this.img_bases.SetPaintColor("#99ff99");
        this.img_bases.DrawRectangle(0, 0, 1, 1);
        this.img_bases.SetTextSize(20);
    	this.img_bases.SetAutoUpdate(false);
    	lay.AddChild(this.img_bases);

    	this.img_scores = app.CreateImage( null, this.width, this.height );
    	this.img_scores.SetPosition(this.x, this.y);
    	this.img_scores.SetPaintColor("#000000");
        this.img_scores.SetTextSize(20);
    	this.img_scores.SetAutoUpdate(false);
    	lay.AddChild(this.img_scores);

    	//create a blank image for the planes.
    	this.img_planes = app.CreateImage( null, this.width, this.height );
    	this.img_planes.SetPosition(this.x, this.y);
    	this.img_planes.SetAutoUpdate(false);
    	this.img_planes.SetOnTouchDown(detect_pressed_base_ai);
    	lay.AddChild(this.img_planes);
    }

	//update all the components on the ai_board
	Update()
    {
        //update the score
        if(this.important_change || Date.now() - this.last_time_score >= 950)
        {
            var xx = Date.now();

            //clear the image
            this.img_scores.Clear();

            //draw all the bases and update the score
            for(var i = 0; i < this.bases.length; i++)
            {
                this.bases[i].UpdateScoreBy(1);

                var base_pos = this.bases[i].GetPosition();
                this.img_scores.DrawText(this.bases[i].GetScore(), base_pos[0]+0.07, base_pos[1]+0.12);
            }

            this.img_scores.Update();
            this.last_time_score = Date.now();

            //console.log(Date.now()-xx);
        }

        if(this.important_change || Date.now() - this.last_time_planes >= 1)
        {

            this.img_planes.Clear();

            var is_finished = false;

            //update the planes location
            for(var i = 0; i < this.planes.length; i++)
            {
                var plane_img = app.CreateImage(this.planes[i].GetPlane(), 0.1, -1);
                var plane_pos = this.planes[i].GetPosition();
                this.img_planes.DrawImage(plane_img, plane_pos[0], plane_pos[1], 0.1, 0.05, this.planes[i].GetAngle());

                is_finished = this.planes[i].UpdatePosition();
                //check if the plane reached its target
                if(is_finished == true)
                {
                    if(this.planes[i].GetOwner() == this.planes[i].GetTargetBase().GetOwner())
                    {
                        //alert("+");
                        this.planes[i].GetTargetBase().UpdateScoreBy(this.planes[i].GetScore(), this.planes[i].GetOwner());
                    }

                    //the planes reached an enemy target
                    else
                    {
                        //alert("-");
                        this.planes[i].GetTargetBase().UpdateScoreBy(-this.planes[i].GetScore(), this.planes[i].GetOwner());
                    }

                    //remove the plane from the planes array
                    this.planes.splice(i, 1);
                }

                //an error occur
                else if(is_finished == "error")
                {
                    this.planes.splice(i, 1);
                    app.ShowPopup("ERROR", "short");
                }
            }

            if(is_finished)
            {
                this.UpdateBases();
            }

            this.img_planes.Update();
            this.last_time_planes = Date.now();
        }

        this.important_change = false;
    }

    //draw all the bases
    UpdateBases()
    {
        this.img_bases.SetBackColor("#99ff99");


        for(var i = 0; i < this.bases.length; i++)
        {
            var base_img = app.CreateImage(this.bases[i].GetBase(), 0.2, -1);
            var base_pos = this.bases[i].GetPosition();
            this.img_bases.DrawImage(base_img, base_pos[0], base_pos[1], 0.2, 0.1);
        }

        this.img_bases.Update();
    }

    //return whether the player didn't lose
    IsAlive()
    {
        var b = 0;
        var r = 0;
        for(var i = 0; i < this.bases.length; i++)
        {
            if(this.bases[i].GetOwner() == "blue")
            {
                b++;
            }

            else if(this.bases[i].GetOwner() == "red")
            {
                r++;
            }
        }

        if(b != 0 && r != 0)
        {
            return "no winner";
        }

        this.important_change = true;
        return this.bases[0].GetOwner();
    }

    //add a new base to the ai_board
    //owner: red/blue
    //x, y: location
    //id: number
    AddBase(owner, x, y, score, id)
    {
        var new_base = new Base(owner, x, y, score, id);
        this.bases.push(new_base);

        this.important_change = true;
    }

    //add a new plane to the ai_board
    //owner: red/blue
    //points: number
    //StartingBase: Base object
    //TargetBase: Base object
    AddPlane(owner, points, StartingBase, TargetBase)
    {
        var new_plane = new Plane(owner, points, StartingBase, TargetBase);
        this.planes.push(new_plane);
        StartingBase.UpdateScoreBy(-StartingBase.GetScore());
        this.important_change = true;
    }

    AddEnemyPlane(owner, points, StartingBaseId, TargetBaseId)
    {
        var StartingBase = null;
        var TargetBase = null;

        for(var i = 0; i < this.bases.length; i++)
        {
            if(this.bases[i].GetId() == StartingBaseId)
            {
                StartingBase = this.bases[i];
            }

            else if(this.bases[i].GetId() == TargetBaseId)
            {
                TargetBase = this.bases[i];
            }
        }

        var new_plane = new Plane(owner, points, StartingBase, TargetBase);
        this.planes.push(new_plane);
        StartingBase.UpdateScoreBy(-StartingBase.GetScore());
        this.important_change = true;
    }

    //return the list of the bases on the ai_board
    GetBases()
    {
        return this.bases;
    }

    //select a base. the first selection is the start and the second is the target
    SelectBase(base)
    {
        //if no base selected -> add the base only if it's color is the same of the player
        //if base already selected -> add the base to the list as a target and release the plane
        if(this.selected_bases.length == 0)
        {
            //add the base as source base only of its the player's base
            if(base.GetId().split(":")[0] == player_color)
            {
                this.selected_bases.push(base);
            }
        }

        //make sure that the base is not the same base as the first one. if so remove the selection of the base
        else if(base.GetId() == this.selected_bases[0].GetId())
        {
            this.selected_bases = [];
        }

        else
        {
            this.selected_bases.push(base);
            //send the plane to its target
            this.ReleasePlane();
        }
    }

    //send the plane to its target
    ReleasePlane()
    {
        var start_base = this.selected_bases[0];
        var target_base = this.selected_bases[1];

        this.AddPlane(player_color, start_base.GetScore(), start_base, target_base);

        this.selected_bases = [];

        this.important_change = true;
    }
}

//detect if a base selected
function detect_pressed_base_ai(ev)
{
    var bases = ai_board.GetBases();

    for(var i = 0; i < bases.length; i++)
    {
        var pos = bases[i].GetPosition();
        if((pos[0] < ev.x[0]) && (ev.x[0] < pos[0] + 0.2) &&
           ((pos[1] < ev.y[0]) && (ev.y[0] < pos[1] + 0.1)))
        {
            ai_board.SelectBase(bases[i]);
        }
    }
}



