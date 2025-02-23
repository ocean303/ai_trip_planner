import React, { useState, useEffect } from 'react';
import { Bell, Shield, AlertTriangle, Cloud, GanttChart, ExternalLink } from 'lucide-react';

const SafetyNews = ({ trip }) => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract city name from the location
  const location = trip?.userChoice?.location?.label?.split(',')[0] || 'Mumbai';

  const fetchNews = async (loc) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5002/api/safety-news/${loc}`);
      const data = await response.json();
      if (data.status === 'success') {
        setNewsData(data);
      } else {
        setError('Failed to fetch news data');
      }
    } catch (err) {
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(location);
  }, [location]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'crime':
        return <Shield className="w-6 h-6 text-red-600" />;
      case 'emergency':
        return <Bell className="w-6 h-6 text-orange-600" />;
      case 'safety':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'security':
        return <GanttChart className="w-6 h-6 text-blue-600" />;
      case 'weather':
        return <Cloud className="w-6 h-6 text-purple-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeGroup = (dateString) => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffTime = now - articleDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 14) return 'Past Week';
    return 'Older';
  };

  const groupAndSortArticles = () => {
    if (!newsData?.articles) return {};

    // Flatten all articles into a single array with category information
    const allArticles = Object.entries(newsData.articles).flatMap(([category, articles]) =>
      articles.map(article => ({
        ...article,
        category,
        timeGroup: getTimeGroup(article.time)
      }))
    );

    // Sort articles by date (most recent first)
    const sortedArticles = allArticles.sort((a, b) => 
      new Date(b.time) - new Date(a.time)
    );

    // Group articles by time period
    const groupedArticles = {
      'Today': [],
      'This Week': [],
      'Past Week': [],
      'Older': []
    };

    sortedArticles.forEach(article => {
      groupedArticles[article.timeGroup].push(article);
    });

    return groupedArticles;
  };

  const handleCardClick = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const groupedArticles = groupAndSortArticles();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Safety News for {location}</h1>
      </div>

      {Object.entries(groupedArticles).map(([timeGroup, articles]) => (
        articles.length > 0 && (
          <div key={timeGroup} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {timeGroup}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({articles.length} {articles.length === 1 ? 'article' : 'articles'})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <div 
                  key={`${article.category}-${index}`} 
                  onClick={() => handleCardClick(article.link)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {getCategoryIcon(article.category)}
                        <span className="ml-2 text-sm font-medium capitalize text-gray-600">
                          {article.category}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(article.time)}</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {article.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-600">{article.source}</span>
                      {article.author && (
                        <span className="text-sm text-gray-500">{article.author.replace('By ', '')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default SafetyNews;