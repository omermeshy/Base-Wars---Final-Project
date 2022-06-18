app.SetDebug( "console" );
//Lock screen orientation to Portrait.
app.SetOrientation( "Portrait" );
//Stop screen turning off.
app.PreventScreenLock( true );
app.PreventWifiSleep();
app.EnableBackKey( false );

app.LoadScript("client.js");
app.LoadScript("Board.js");
app.LoadScript("Base.js");
app.LoadScript("Plane.js");
app.LoadScript("Game Boards.js");
app.LoadScript("AI_Board.js");
app.LoadScript("AI functions.js");

back_keys = [];

function OnStart()
{
    back_keys.push("Home");
    app.ShowTextDialog( "Enter server's IP:", "192.168.204.", OnInput );

    lay_start = app.CreateLayout( "Linear", "VCenter,FillXY" );
    lay_start.SetBackColor("white");

    //log in text
    var txt_log_in = app.CreateText( "Log in", -1, -1, "Bold" );
    txt_log_in.SetTextSize( 40 );
    txt_log_in.SetTextColor("black");
    lay_start.AddChild( txt_log_in );

    //text edit for username
    txtedt_login_username = app.CreateTextEdit( "omer", 0.5, -1, "SingleLine" );
    txtedt_login_username.SetHint("Username");
    txtedt_login_username.SetTextColor("#595959");
    txtedt_login_username.SetBackColor("#d9d9d9");
    txtedt_login_username.SetMargins(-1, 0.01, -1, 0.01);
	lay_start.AddChild( txtedt_login_username );

	//text edit for password
	txtedt_login_password = app.CreateTextEdit( "1234", 0.5, -1, "Password,SingleLine" );
    txtedt_login_password.SetHint("Password");
    txtedt_login_password.SetTextColor("#595959");
    txtedt_login_password.SetMargins(-1, 0.01, -1, 0.01);
    txtedt_login_password.SetBackColor("#d9d9d9");
	lay_start.AddChild( txtedt_login_password );

	//log in button
	btn_login = app.CreateButton("Log in [fa-sign-in]", 0.3, -1, "Custom, fontawesome");
	btn_login.SetStyle("#9932ed86", "#9932ed86", 10, "#737373", 2, 0);
	btn_login.SetTextColor("#000000");
	btn_login.SetOnTouch(send_login_request);
	lay_start.AddChild( btn_login );

	//***

	//create new account text
	var txt_log_register = app.CreateText( "Create new account", -1, -1, "Bold" );
    txt_log_register.SetTextSize( 40 );
    txt_log_register.SetTextColor("black");
    txt_log_register.SetMargins(0, 0.1, 0, 0);
    lay_start.AddChild( txt_log_register );

	///text edit for username
    txtedt_register_username = app.CreateTextEdit( "", 0.5, -1, "SingleLine" );
    txtedt_register_username.SetHint("Username");
    txtedt_register_username.SetTextColor("#595959");
    txtedt_register_username.SetBackColor("#d9d9d9");
    txtedt_register_username.SetMargins(-1, 0.01, -1, 0.01);
	lay_start.AddChild( txtedt_register_username );

	//text edit for password
	txtedt_register_password = app.CreateTextEdit( "", 0.5, -1, "Password,SingleLine" );
    txtedt_register_password.SetHint("Password");
    txtedt_register_password.SetTextColor("#595959");
    txtedt_register_password.SetMargins(-1, 0.01, -1, 0.01);
    txtedt_register_password.SetBackColor("#d9d9d9");
	lay_start.AddChild( txtedt_register_password );

	//text edit fo email
	txtedt_register_email = app.CreateTextEdit( "", 0.5, -1, "SingleLine" );
    txtedt_register_email.SetHint("Email");
    txtedt_register_email.SetTextColor("#595959");
    txtedt_register_email.SetBackColor("#d9d9d9");
    txtedt_register_email.SetMargins(-1, 0.01, -1, 0.01);
	lay_start.AddChild( txtedt_register_email );

	//register button
	btn_register = app.CreateButton("Register [fa-user-plus]", 0.3, -1, "Custom, fontawesome");
	btn_register.SetStyle("#9932ed86", "#9932ed86", 10, "#737373", 2, 0);
	btn_register.SetTextColor("#000000");
	btn_register.SetOnTouch(send_register_request);
	lay_start.AddChild( btn_register );


	btn_training = app.CreateButton( "Training", 0.8, -1, "Custom" );
	btn_training.SetStyle("#9973ccff", "#9973ccff", 10, "#737373", 2, 0);
	btn_training.SetTextColor("#000000");
	btn_training.SetOnTouch( start_ai_mode );
	lay_start.AddChild( btn_training );

    app.AddLayout( lay_start );
    //start();
}

//show list of all the online users
function show_list_of_online_users()
{
    back_keys.push("Online");
    //send request for getting the online users list
    get_online_users();

    lay_select_opponent = app.CreateLayout( "Linear", "VCenter,FillXY" );
    lay_select_opponent.SetBackColor("white");

    //create new account text
	var txt_online_users = app.CreateText( "Online Users", -1, -1, "Bold" );
    txt_online_users.SetTextSize( 40 );
    txt_online_users.SetTextColor("black");
    txt_online_users.SetMargins(0, 0.1, 0, 0);
    lay_select_opponent.AddChild( txt_online_users );

    var btn_update_online_user_list = app.CreateButton("[fa-refresh]", -1, 0.08, "fontawesome, Custom");
    btn_update_online_user_list.SetStyle("#97f7d1", "#97f7d1", 500, "#9e9e9e", 2, 0);
    btn_update_online_user_list.SetTextColor("black");
    btn_update_online_user_list.SetTextSize(30);
    btn_update_online_user_list.SetOnTouch(get_online_users);
    lay_select_opponent.AddChild(btn_update_online_user_list);

    //list of all the online users
	list_online_users = app.CreateList("", 0.6, 0.8, "Expand, fontawesome");
	list_online_users.SetTextColor("black");
	list_online_users.SetTextSize(20);
	list_online_users.SetOnTouch(send_play_request);
	lay_select_opponent.AddChild(list_online_users);

    app.AddLayout( lay_select_opponent );
}

//initial all the settings for the game and start playing
function start(current_player_color, board_number)
{
    //the color of the user
    player_color = current_player_color;
    opponent_color = "";

    txt_color = app.CreateText( "", -1, -1, "left,Center" );
    txt_color.SetTextSize(17);
    txt_color.SetPosition(0.7, 0.01);

    if(player_color == "red")
    {
        opponent_color = "blue";
        txt_color.SetText("You are red");
        txt_color.SetBackColor("#f52f2f");
        txt_color.SetTextColor("white");
    }

    else
    {
        opponent_color = "red";
        txt_color.SetText("You are blue");
        txt_color.SetBackColor("#679df5");
        txt_color.SetTextColor("white");
    }
    lay_game = app.CreateLayout("Absolute");

    //create the game board
    board = new Board(lay_game, 1, 1, 0, 0);

    //the board number (random)
    //var board_number = Math.floor(Math.random() * 10);

    //add all the bases to the board
    for(var i = 0; i < game_boards[board_number].length; i++)
    {
        var b = game_boards[board_number][i];
        board.AddBase(b[0], b[1], b[2], b[3], b[4]);
    }

    board.UpdateBases();

    //fps text
    txt = app.CreateText( "", .5, .1, "left" );
    lay_game.AddChild( txt );
    lay_game.AddChild( txt_color );

    ltime = Date.now(), c = 0;

    game_interval = setInterval(game, 1000/60);
    //app.Animate( game, 60 );
    //game();

    app.AddLayout(lay_game);
}

function game()
{
    //speed test operation
    c++;
    var time = Date.now();
    if( time - ltime >= 1000 ) {
        txt.SetText( c + " cps, " + (time - ltime) + ", " + Math.round(( c * 1000 ) / (time - ltime )) );
        ltime = Date.now();
        c = 0;
    }

    var game_state = board.IsAlive();
    if(game_state == "no winner")
    {
    	//update the board
    	board.Update();

    	//call this function
    	//setTimeout(game, 0);
    }

    //end game
    else
    {
        //update the board
    	board.Update();

        clearInterval(game_interval);
        alert("Game Over " + game_state + " Won the game");
        app.DestroyLayout(lay_game);
    }
}

//initial all the settings for the game and start playing
function start_ai_mode()
{
    //the color of the user
    player_color = "blue";
    opponent_color = "red";

    lay_game = app.CreateLayout("Absolute");

    //create the game ai_board
    ai_board = new AI_Board(lay_game, 1, 1, 0, 0);

    //the ai_board number (random)
    var board_number = Math.floor(Math.random() * 10);

    //add all the bases to the ai_board
    for(var i = 0; i < game_boards[board_number].length; i++)
    {
        var b = game_boards[board_number][i];
        ai_board.AddBase(b[0], b[1], b[2], b[3], b[4]);
    }

    ai_board.UpdateBases();

    //fps text
    txt = app.CreateText( "", 0.5, 0.1, "left" );
    lay_game.AddChild( txt );

    txt_color = app.CreateText( "You are blue", -1, -1, "left,Center" );
    txt_color.SetBackColor("#679df5");
    txt_color.SetTextColor("white");
    txt_color.SetTextSize(17);
    txt_color.SetPosition(0.7, 0.01);
    lay_game.AddChild( txt_color );

    ltime = Date.now(), c = 0;

    ai_game_interval = setInterval(ai_game, 1000/60);
    ai_actions = setInterval(ai_play, 4000);

    app.AddLayout(lay_game);
}

function ai_game()
{
    //speed test operation
    c++;
    var time = Date.now();
    if( time - ltime >= 1000 ) {
        txt.SetText( c + " cps, " + (time - ltime) + ", " + Math.round(( c * 1000 ) / (time - ltime )) );
        ltime = Date.now();
        c = 0;
    }

    var game_state = ai_board.IsAlive();
    if(game_state == "no winner")
    {
    	//update the ai_board
    	ai_board.Update();
    }

    //end game
    else
    {
        //update the ai_board
    	ai_board.Update();

        clearInterval(ai_game_interval);
        clearInterval(ai_actions);
        alert("Game Over " + game_state + " Won the game");
        app.DestroyLayout(lay_game);
    }
}

function OnBack()
{
    if(back_keys[back_keys.length - 1] == "Home")
    {
        var yes_no = app.CreateYesNoDialog( "Close the app?" );
        yes_no.SetOnTouch( yesNo_OnTouch );
        yes_no.Show();
    }

    else if(back_keys[back_keys.length - 1] == "Online")
    {
        app.RemoveLayout(lay_select_opponent);
        back_keys.pop();
    }
}

//Called when application is paused.
//(eg. When user switches to home screen)
function OnPause()
{
	disconnect_server();
}

function yesNo_OnTouch( result )
{
    if( result == "Yes" )
    {
        disconnect_server();
        app.Exit();
    }
}

function OnInput( name )
{
    connect_to_server(name, 9601);
}
