# Description:
#   Send messages using the Hipchat API (which allows you to choose colors
#   and send html messages) instead of the plain old jabber interface
#
# Dependencies:
#   "querystring": "0.1.0"
#
# Configuration:
#   HUBOT_HIPCHAT_TOKEN - Hipchat API token
#
# Commands:
#   None
#
# URLs:
#   GET /hubot/hipchat?room_id=<room_id>&message=<message>&from=<from>[&color=<red/yellow/green/gray/purple/random>&notify=<true/false>&message_format=<html/text>]
#
# Author:
#   mcdavis

querystring = require('querystring')

module.exports = (robot) ->
  alertEvent = "hipchat-alert"
  baseurl = "api.hipchat.com"

  hipchat = {}
  hipchat.format = 'json'
  hipchat.auth_token = process.env.HUBOT_HIPCHAT_TOKEN

  robot.on alertEvent, (query) ->
    https = require 'https'

    hipchat.room_id = query.room_id if query.room_id
    hipchat.message = query.message if query.message
    hipchat.from = query.from if query.from
    hipchat.color = query.color if query.color
    hipchat.notify = query.notify if query.notify
    hipchat.message_format = query.message_format if query.message_format

    params = querystring.stringify(hipchat)
    path = "/v1/rooms/message/?#{params}"
    data = ''

# BUG: res is not defined... rethink using msg.http().get() cb
# http://theprogrammingbutler.com/blog/archives/2011/10/28/hubot-scripts-explained/
    robot.http("http://#{baseurl}#{path}")
      .get() (err, res, body) ->
        if err
          msg.send "Encountered an error :( #{err}"
          return
        if res.statusCode isnt 200
          msg.send "Request didn't come back HTTP 200 :("
          return
        rateLimitRemaining = parseInt res.getHeader('X-RateLimit-Limit') if res.getHeader('X-RateLimit-Limit')
        if rateLimitRemaining and rateLimitRemaining < 1
          msg.send "Rate Limit hit, stop believing for awhile"
          return
        msg.send body

    # https.get {host: 'api.hipchat.com', path: path}, (res) ->
    #   res.on 'data', (chunk) ->
    #     data += chunk.toString()
    #   res.on 'end', () ->
    #     json = JSON.parse(data)
    #     console.log "Hipchat response ", data
    #     callback()

  robot.router.get "/#{robot.name}/hipchat", (req, res) ->
    query = querystring.parse req._parsedUrl.query
    robot.emit alertEvent, query

  robot.respond /code (.+) (say|do) (.+)/i, (msg) ->
    color = msg.match[1]
    action = msg.match[2]
    message = msg.match[3]
    msg.send "Okay! I'll #{action} #{message} as a code #{color}."

    query = {
      room_id: 210951
      message: message
      color: color
      from: "#{robot.name}"
      format: "html"
    }
    robot.emit alertEvent, query