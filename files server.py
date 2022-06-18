from aiohttp import web


async def hello(request):
    return web.Response(text="Ready for your command master!")


async def upload_file(request):
    # get the post data
    data = await request.post()
    # get keys
    tmp = data.keys()
    # extract name string from keys
    fileName = (str(tmp).split("'")[1])
    # read the file content
    fileContent = data[fileName].file.read()

    # save the file
    with open(fileName, 'wb') as f:
        f.write(fileContent)

        # return thankYou to the client
    return web.Response(text='thankYou', content_type="text/html")


# set server
app = web.Application(client_max_size=1024 ** 3)
# set GET landing page
app.add_routes([web.get('/', hello)])
# set POST upload page
app.add_routes([web.post('/upload', upload_file)])
# start server
web.run_app(app, host='0.0.0.0', port=8085)
