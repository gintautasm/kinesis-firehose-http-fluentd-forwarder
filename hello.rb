require 'agoo'
require 'json'
require 'time'
require 'fluent-logger'

Agoo::Server.init(6464, 'user')

Fluent::Logger::FluentLogger.open(nil, :host => 'localhost', :port => 24224)


class MyHandler
  def call(req)
    #puts 'abcd'
    #req['rack.input'].rewind
    #puts req['body']
    rqs_str = req['rack.input'].read
    #puts rqs_str
    rqs_obj = JSON.parse(rqs_str)
    #puts rqs_obj
    Fluent::Logger.post("test.input", rqs_obj)
    ts = Time.now.getutc.to_i
    #ts = Time.now.getutc.to_f

    rsp = {"requestId" => rqs_obj['RequestId'], "timestamp" => ts}
    [ 200, { "Content-type" => "application/json" }, ["#{rsp.to_json}\n"] ]
  end
end

handler = MyHandler.new
Agoo::Server.handle(:POST, "/hello", handler)
Agoo::Server.start()

# To run this example type the following then go to a browser and enter a URL
# of localhost:6464/hello.
#
# ruby hello.rb