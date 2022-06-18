function ai_play()
{
    lay_game.SetTouchable(false);
    //all the bases on the board
    var bases = ai_board.GetBases();

    //oponent's
    blue_bases = [];
    //ai's
    red_bases = [];
    //neutral
    neutral_bases = [];

    sort_bases_by_owner(bases);

    for(var i = 0; i < red_bases.length; i++)
    {
        for(var j = 0; j < blue_bases.length; j++)
        {
            if(red_bases[i].GetScore() > blue_bases[j].GetScore())
            {
                ai_board.AddPlane("red", red_bases[i].GetScore(), red_bases[i], blue_bases[j]);
                i = 10;
                j = 10;
            }
        }
    }

    for(var i = 0; i < red_bases.length; i++)
    {
        for(var j = 0; j < neutral_bases.length; j++)
        {
            if(red_bases[i].GetScore() > neutral_bases[j].GetScore())
            {
                ai_board.AddPlane("red", red_bases[i].GetScore(), red_bases[i], neutral_bases[j]);
                i = 10;
                j = 10;
            }
        }
    }

    //setTimeout("ai_play()", 4000);
    lay_game.SetTouchable(true);
}

function sort_bases_by_owner(bases)
{
    for(var i = 0; i < bases.length; i++)
    {
        var owner = bases[i].GetOwner();

        if(owner == "blue")
        {
            blue_bases.push(bases[i]);
        }

        else if(owner == "red")
        {
            red_bases.push(bases[i]);
        }

        else
        {
            neutral_bases.push(bases[i]);
        }
    }
}
