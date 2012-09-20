require "rubygems"
require "bundler/setup"
Bundler.require(:default, ENV['RACK_ENV'])
require './blog.rb'

# Rack config
use Rack::Static, :urls => ['/css', '/js', '/images', '/fonts', '/favicon.ico', '/cv.pdf', '/googlec44438f9318443e5.html', '/robots.txt'], :root => 'public'
use Rack::CommonLogger
use Rack::Codehighlighter,
  :ultraviolet,
  :theme => "sunburst",
  :markdown => true,
  :element => "pre>code",
  :pattern => /\A:::(\w+)\s*(\n|&#x000A;)/i,
  :logging => true

unless ENV['RACK_ENV'] == 'production'
  use Rack::ShowExceptions
  use Rack::Nocache
  #map "/evergreen" do
    #run Evergreen::Suite.new(File.dirname(__FILE__)).application
  #end
else
  use Rack::Rewrite do
    r301 %r{.*}, 'http://harry.me$&', :if => Proc.new {|rack_env|
      ['harry.me', 'stage.harry.me'].none? {|name| name == rack_env['SERVER_NAME']}
    }
  end
  require 'newrelic_rpm'
end

#
# Create and configure a toto instance
#
toto = Toto::Server.new do
  set :author,      "Harry Brundage"                          # blog author
  set :title,       "Will You Harry Me?"                      # site title
  unless ENV['RACK_ENV'] == 'production'
    set :url, 'http://localhost:3000'
  else
    set :url, 'http://harry.me'                               # site root URL
  end
  set :prefix,      ''                                        # common path prefix for all pages
  set :root,        "index"                                   # page to load on /
  set :date,        lambda {|now| now.strftime("%d/%m/%Y") }  # date format for articles
  set :markdown,    :smart                                    # use markdown + smart-mode
  set :disqus,      "harrisonbrundage"                        # disqus id, or false
  set :summary,     :max => 150, :delim => /~\n/              # length of article summary and delimiter
  set :ext,         'md'                                      # file extension for articles
  set :cache,       28800                                     # cache site for 8 hours
  set :date, lambda {|now| now.strftime("%B #{now.day.ordinal} %Y") }

  # Github username and list of repos
  rs = {"thwart" => "README.rdoc", "titanium_ajax" => "README.mkd"}
  set :github, {:user => "hornairs", :repos => rs.keys, :files => rs}

  # The HTML for the error page
  set :error do |code|
   "<font style='font-size:300%'>toto, we're not in Kansas anymore (#{code})</font>"
  end

  set :to_html, lambda {|path, page, ctx, blk|
    Dir.glob("#{path}/#{page}.*").each do |filename|
      return ::Tilt.new(filename).render(ctx, &blk)
    end
    raise Errno::ENOENT
  }

end

map '/assets' do
  environment = Sprockets::Environment.new
  environment.append_path 'assets/coffeescripts'
  environment.append_path 'assets/sass'
  run environment
end

map "/" do
  run toto
end
