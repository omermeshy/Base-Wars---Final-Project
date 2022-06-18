//connect to server
//server_ip: ip
//port: number
function connect_to_server(server_ip, port)
{
    net = app.CreateNetClient( "TCP,Raw" );
    net.SetOnConnect( net_on_connect );
    net.SetOnReceive( on_receive );
    net.AutoReceive( server_ip, port, "UTF-8" );
    //net.Connect( server_ip, port );
}

//called when connected or disconnected from the server
function net_on_connect( connected )
{
    if( !connected )
    {
        return app.ShowPopup( "Failed to connect!" );
    }

    else
    {
        fake_packets_interval = setInterval(send_fake_packets, 5000)
        return app.ShowPopup( "Connect!" );
    }
}

function send_fake_packets()
{
    net.SendText( "_Fake_", "UTF-8" );
}

function disconnect_server()
{
    try
    {
        clearInterval(fake_packets_interval);
    }

    catch (error)
    {
      console.log(error);
    }

    try
    {
        net.SendText( "DISCONNECTED", "UTF-8" );
        net.Disconnect();
        app.ShowPopup("Disconnecting");
    }

    catch (error)
    {
      console.log(error);
    }
}

//called when received data from the server
function on_receive(data)
{
    console.log(data);
    //get the data header
    header = data.split(";")[0];

    //login response
    if(header == "[ATTEMPT_TO_LOGIN]")
    {
        var status = data.split(";")[1];

        if(status == "Connected")
        {
            app.ShowPopup("Connected");
            show_list_of_online_users();
        }

        else if(status == "Username not exists")
        {
            app.ShowPopup("Username not exists");
        }

        else if(status == "Wrong password")
        {
            app.ShowPopup("Wrong password");
        }
    }

    //register response
    else if(header == "[ATTEMPT_TO_CREATE_NEW_ACCOUNT]")
    {
        status = data.split(";")[1];

        if(status == "Created")
        {
            app.ShowPopup("Created");
        }

        else
        {
            app.ShowPopup(status);
        }
    }

    //get list of online users response
    else if(header == "[ONLINE_USERS]")
    {
        var online_users = data.split(";")[1].split(",");
        var str = "";

        //add icon
        for(var i = 0; i < online_users.length; i ++)
        {
            str += online_users[i] + ":[fa-user-circle],";
        }

        list_online_users.SetList(str);

        app.ShowPopup("Updated");
    }

    else if(header == "[PLAYER_WANTS_TO_PLAY]")
    {
        opponent = data.split(";")[1];
        var ynd = app.CreateYesNoDialog( opponent + " wants to play with you.\nDo you want to play?" );
        ynd.SetOnTouch( answer_play_request );
        ynd.Show();
    }

    else if(header == "[START_GAME]")
    {
        opponent = data.split(";")[1];
        var player_color = data.split(";")[2];
        var board_number = data.split(";")[3];

        start(player_color, board_number);
    }

    else if(header == "[GAME_REJECTED]")
    {
        opponent = data.split(";")[1];
        alert(opponent + " rejected your game request");
        opponent = null;
    }

    else if(header == "[NEW_PLANE_LAUNCHED]")
    {
        //opponent = data.split(";")[1];
        //username = data.split(";")[2];
        var opponent_color = data.split(";")[3];
        var score = parseInt(data.split(";")[4]);
        var start_base_id = data.split(";")[5];
        var target_base_id = data.split(";")[6];
        board.AddEnemyPlane(opponent_color, score, start_base_id, target_base_id);
    }

    else if(header == "[Fake]")
    {
        //app.ShowPopup(header);
    }
}

//send login request
function send_login_request()
{
    net.SendText( "[LOGIN];" + txtedt_login_username.GetText().trim() +
                               ";" +
                               txtedt_login_password.GetText().trim(), "UTF-8" );
    username = txtedt_login_username.GetText().trim();
}

//send register request
function send_register_request()
{
    net.SendText( "[CREATE_NEW_ACCOUNT];" + txtedt_register_username.GetText().trim() +
                                            ";" +
                                            txtedt_register_password.GetText().trim() +
                                            ";" +
                                            txtedt_register_email.GetText().trim(), "UTF-8" );
}

//send get online users request
function get_online_users()
{
    net.SendText( "[GET_ONLINE_USERS];", "UTF-8" );
}

//send start play request
//user: username
function send_play_request(user)
{
    net.SendText( "[PLAY_REQUEST];" + user +
                                ";" + username, "UTF-8" );
}

function send_new_plane_launched(player_color, score, start_base_id, target_base_id)
{
    net.SendText( "[NEW_PLANE_LAUNCHED];" + username +
                                      ";" + opponent +
                                      ";" + player_color +
                                      ";" + score +
                                      ";" + start_base_id +
                                      ";" + target_base_id, "UTF-8" );
}

function answer_play_request( result )
{
    if(result == "Yes")
    {
        net.SendText( "[START_NEW_GAME];" + username +
                                      ";" + opponent, "UTF-8" );
    }

    else if(result == "No")
    {
        net.SendText( "[REJECT_NEW_GAME];" + username +
                                      ";" + opponent, "UTF-8" );
    }
}

