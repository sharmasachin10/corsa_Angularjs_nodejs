//************use for upload image
module.exports =  function ($parse) {
     return {
          scope: {
            schrollBottom: "="
            },
    link: function (scope, element) {
      scope.$watchCollection('schrollBottom', function (newValue) {
        if (newValue)
        {
          $(element).scrollTop($(element)[0].scrollHeight);
        }
      });
         }
     };
}
