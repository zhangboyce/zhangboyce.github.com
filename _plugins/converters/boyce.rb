module Jekyll
	class BoyceConverter < Converter
		safe true
		priority :low

		def matches(ext)
			ext =~ /\.boyce$/
		end

		def output_ext(ext) 
			".html"
		end

		def convert(content)
			# replace tab char of head to 2 \u3000 char
			content = content.gsub(/(^\t)/,"\u3000\u3000")

			# replace 2 empty lines to a <hr/> tag
			content = content.gsub(/(([ \t]*\n){3,})/, "\n<hr/>\n")

			# replace @code line to {% highlight code %} line
			content = content.gsub(/(^@([a-z]+):\s*$)/, "{% highlight \\2 %}")

			# replace @ code end line to {% endhighlight %} line
			content = content.gsub(/(^@end\s*$)/, "{% endhighlight %}")

			#puts "Boyce Converter#{content}"
		end

	end
end

# if __FILE__ == $0
#   cv = BoyceConverter.new
#   cv.convert("@java: 
#   	public ***
# @end
#   	#g Boyce this is a g #g sss #g ")
# end