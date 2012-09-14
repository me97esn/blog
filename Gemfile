source :gemcutter

gem 'toto', '0.4.9'
gem 'rack-rewrite'
gem 'compass', '0.10.6'
gem 'haml', '3.0.25'
gem 'tilt'
gem 'rack-codehighlighter', :require => 'rack/codehighlighter'
gem "rack-nocache"
#gem "evergreen", :git => "git@github.com:hornairs/evergreen.git", :submodules => true

# Ultraviolet. God what a pain.
gem 'plist', :git => "git://github.com/spox/plist.git"
gem 'textpow', :git => "git://github.com/spox/textpow.git"
gem 'ultraviolet1x', :require => 'uv'

group :production do
  gem 'newrelic_rpm'
  gem 'thin'
end

group :development, :test do
  gem 'guard'
  gem 'guard-coffeescript'
  gem 'guard-compass'
  gem 'thin'
  gem 'growl'
end
