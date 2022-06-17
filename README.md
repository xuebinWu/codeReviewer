
# codeReviewer
codeReviewer 是一个用来做代码评审的扩展，可标注问题代码，同步至代码仓库。开发人员同步数据后，可修改对应的代码问题，再提交评审。
# 如何使用 ?
### 标注问题代码（审核人员）
1. 选中问题代码，在问题代码上点击鼠标右键，选择 `'codeReviewer'`
2. 在弹出的窗口中填入信息，点击Add Issue（首次保存时将在项目根路径下生成一个codeReviewer.csv文件）
3. 提交codeReviewer.csv文件至仓库中，即完成代码审核

![](https://raw.githubusercontent.com/xuebinWu/codeReviewer/master/static/step1.gif)

### 修复问题代码（开发人员）
1. 拉取仓库中codeReviewer.csv文件，并打开
2. 在显示为 unresolved 的行中，点击鼠标右键，选择 `'codeReviewer'`
3. 修改完后，点击窗口中的Resolved按钮，再推送codeReviewer.csv文件至仓库中，即完成修改。

![](https://raw.githubusercontent.com/xuebinWu/codeReviewer/master/static/step2.gif)

### 查看修改完的代码（审核人员）
1. 拉取仓库中codeReviewer.csv文件，并打开
2. 在显示为 resolved 的行中，点击鼠标右键，选择 `'codeReviewer'`(需安装GitLens插件)
![](https://raw.githubusercontent.com/xuebinWu/codeReviewer/master/static/step3.gif)
--------
### CodeReviewer is a extension for code review.

# How to use ?
### how to review code
1. choose those bad codes, and right click on the selection
2. select `'codeReviewer'` in the menu
3. click 'Add Issue' button ( the extention will create a file named 'codeReviewer.csv' in your project )
4. commit the file (codeReviewer.csv) to repository, so others can solve those problems.
### how to resolve those review issues
1. open the file 'codeReviewer.csv', and right click on a 'unresolved' line
2. select `'codeReviewer'` in the menu
3. click 'Resolved' button after you resolved the issue
4. push the file (codeReviewer.csv) to repository, so code reviewer can check your modification.

## For more information

* [Github](https://github.com/xuebinWu/codeReviewer.git)

**Enjoy!**
