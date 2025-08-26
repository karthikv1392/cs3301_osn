FROM ruby:3.1-slim

# Install minimal build tools and node (some Jekyll plugins expect node)
RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends build-essential nodejs git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/jekyll

# Copy Gemfile and install gems first (layer caching)
COPY Gemfile Gemfile.lock ./

# Avoid installing development/test groups from gems if present
RUN gem install bundler -v "2.4.13" || gem install bundler \
  && bundle config set without 'development:test' || true \
  && bundle install --jobs 4 --retry 3

# Copy the rest of the site
COPY . .

EXPOSE 4000

# Serve the site so it's reachable from the host
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--watch"]
